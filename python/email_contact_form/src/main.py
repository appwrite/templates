import os

from .utils import get_static_file, throw_if_missing, send_email, template_form_message
from .cors import is_origin_permitted, get_cors_headers
from urllib.parse import parse_qs, urljoin


class ErrorCode:
    INVALID_REQUEST = "invalid-request"
    MISSING_FORM_FIELDS = "missing-form-fields"
    SERVER_ERROR = "server-error"


def main(context):
    throw_if_missing(
        os.environ,
        [
            "SUBMIT_EMAIL",
            "SMTP_HOST",
            "SMTP_USERNAME",
            "SMTP_PASSWORD",
        ],
    )

    if os.getenv("ALLOWED_ORIGINS", "*") == "*":
        context.log(
            "WARNING: Allowing requests from any origin - this is a security risk!"
        )

    if context.req.method == "GET" and context.req.path == "/":
        return context.res.send(
            get_static_file("index.html"),
            200,
            {
                "Content-Type": "text/html; charset=utf-8",
            },
        )

    if context.req.headers["content-type"] == "application/x-www-form-urlencoded":
        context.error("Incorrect content type")
        return context.res.redirect(
            f"{context.req.headers['referer']}?code={ErrorCode.INVALID_REQUEST}"
        )

    if not is_origin_permitted(context.req):
        context.error("Origin not permitted")
        return context.res.redirect(
            f"{context.req.headers['referer']}?code={ErrorCode.INVALID_REQUEST}"
        )

    form = parse_qs(context.req.body)
    form = {key: value[0] for key, value in form.items()}

    try:
        throw_if_missing(form, ["email"])
    except ValueError as err:
        return context.res.redirect(
            f"{context.req.headers['referer']}?code={ErrorCode.MISSING_FORM_FIELDS}",
            301,
            get_cors_headers(context.req),
        )

    try:
        send_email(
            {
                "from": os.getenv("SMTP_USERNAME"),
                "to": os.getenv("SUBMIT_EMAIL"),
                "subject": "New Contact Form Submission",
                "text": template_form_message(form),
            }
        )
    except Exception as err:
        context.error(err)
        return context.res.redirect(
            f"{context.req.headers['referer']}?code={ErrorCode.SERVER_ERROR}",
            301,
            get_cors_headers(context.req),
        )

    if not form["_next"]:
        return context.res.send(
            get_static_file("success.html"),
            200,
            "content-type: text/html; charset=utf-8",
        )

    return context.res.redirect(
        urljoin(context.req.headers["referer"], form["_next"][0]),
        301,
        get_cors_headers(context.req),
    )
