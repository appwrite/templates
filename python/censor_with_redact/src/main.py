import requests

from .utils import throw_if_missing, get_static_file


def main(context):
    throw_if_missing(context.env, ["PANGEA_REDACT_TOKEN"])

    if context.req.method == "GET":
        return context.res.text(
            get_static_file("index.html"),
            200,
            {"Content-Type": "text/html; charset=utf-8"},
        )

    try:
        throw_if_missing(context.req.body, ["text"])
    except Exception as err:
        return context.res.json({"ok": False, "error": err.message}, 400)

    response = requests.post(
        "https://redact.aws.eu.pangea.cloud/v1/redact",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {context.env['PANGEA_REDACT_TOKEN']}",
        },
        json={"text": context.req.body["text"]},
    )

    data = response.json()
    return context.res.json({"ok": True, "redacted": data["result"]["redacted_text"]})
