import os
# Import necessary modules and custom functions
from .utils import get_static_file, throw_if_missing, send_email, template_form_message
from .cors import is_origin_permitted, get_cors_headers
from urllib.parse import parse_qs, urljoin

# Define error codes as an enum
class ErrorCode:
    INVALID_REQUEST = "invalid-request"
    MISSING_FORM_FIELDS = "missing-form-fields"
    SERVER_ERROR = "server-error"

# Main function for handling HTTP requests
def main(context):
     # Check for the presence of required environment variables
    throw_if_missing(
        os.environ,
        [
            "SUBMIT_EMAIL",
            "SMTP_HOST",
            "SMTP_USERNAME",
            "SMTP_PASSWORD",
        ],
    )
    # Warn if all origins are allowed (security risk)
    if os.getenv("ALLOWED_ORIGINS", "*") == "*":
        context.log(
            "WARNING: Allowing requests from any origin - this is a security risk!"
        )
    # Handle GET request for the homepage
    if context.req.method == "GET" and context.req.path == "/":
        return context.res.send(
            get_static_file("index.html"),
            200,
            {
                "Content-Type": "text/html; charset=utf-8",
            },
        )
    # Check content type of the request
    if context.req.headers["content-type"] == "application/x-www-form-urlencoded":
        context.error("Incorrect content type")
        return context.res.redirect(
            f"{context.req.headers['referer']}?code={ErrorCode.INVALID_REQUEST}"
        )
    # Check if the origin is permitted
    if not is_origin_permitted(context.req):
        context.error("Origin not permitted")
        return context.res.redirect(
            f"{context.req.headers['referer']}?code={ErrorCode.INVALID_REQUEST}"
        )
    # Parse form data from the request
    form = parse_qs(context.req.body)
    form = {key: value[0] for key, value in form.items()}

    try:
        # Check for the presence of the "email" field in the form
        throw_if_missing(form, ["email"])
    except ValueError as err:
        return context.res.redirect(
            f"{context.req.headers['referer']}?code={ErrorCode.MISSING_FORM_FIELDS}",
            301,
            get_cors_headers(context.req),
        )

    try:
        # Send an email with form data
        send_email(
            {
                "from": os.getenv("SMTP_USERNAME"),
                "to": os.getenv("SUBMIT_EMAIL"),
                "subject": "New Contact Form Submission",
                "text": template_form_message(form),
            }
        )
    except Exception as err:
        # Handle email sending error
        context.error(err)
        return context.res.redirect(
            f"{context.req.headers['referer']}?code={ErrorCode.SERVER_ERROR}",
            301,
            get_cors_headers(context.req),
        )
    # If no "_next" field, show a success page
    if not form["_next"]:
        return context.res.send(
            get_static_file("success.html"),
            200,
            "content-type: text/html; charset=utf-8",
        )
    # Redirect to the URL specified in the "_next" field
    return context.res.redirect(
        urljoin(context.req.headers["referer"], form["_next"][0]),
        301,
        get_cors_headers(context.req),
    )
