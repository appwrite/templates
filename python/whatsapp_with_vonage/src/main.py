from .utils import get_static_file, throw_if_missing
import os
from jwt import decode
from requests import post


def main(context):
    throw_if_missing(
        dict(os.environ),
        [
            "VONAGE_API_KEY",
            "VONAGE_API_SECRET",
            "VONAGE_API_SIGNATURE_SECRET",
            "VONAGE_WHATSAPP_NUMBER",
        ],
    )

    if context.req.method == "GET":
        return context.res.send(
            get_static_file("index.html"),
            200,
            {"content-type": "text/html"},
        )

    body = context.req.body
    headers = context.req.headers
    token = (headers["authorization"] or "").split(" ")[1]
    try:
        decode(token, os.environ["VONAGE_API_SIGNATURE_SECRET"], ["HS256"])
    except Exception as e:
        return context.res.json({"ok": False, "error": "Invalid token!"}, 403)

    try:
        throw_if_missing(body, ["from", "text"])
    except ValueError as e:
        return context.res.json({"ok": False, "error": e}, 400)

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    data = {
        "from": os.environ["VONAGE_WHATSAPP_NUMBER"],
        "to": body["from"],
        "message_type": "text",
        "text": f'you sent: {body["text"]}',
        "channel": "whatsapp",
    }

    url = "https://messages-sandbox.nexmo.com/v1/messages"
    response = post(
        url,
        headers=headers,
        json=data,
        auth=(os.environ["VONAGE_API_KEY"], os.environ["VONAGE_API_SECRET"]),
    )

    if response.ok:
        result = response.json()
        context.log(result)
        return context.res.json({"ok": True})
    else:
        context.error(f"Error {response.text}")
        return context.res.json({"ok": False}, 500)
