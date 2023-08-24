import os


def is_origin_permitted(req):
    if os.getenv("ALLOWED_ORIGINS", "*") == "*":
        return True

    allowed_origins_list = os.getenv("ALLOWED_ORIGINS").split(",")
    return req.headers.get("Origin") in allowed_origins_list


def get_cors_headers(req):
    if "origin" not in req.headers:
        return {}

    return {
        "Access-Control-Allow-Origin": "*"
        if os.getenv("ALLOWED_ORIGINS", "*") == "*"
        else req.headers["origin"],
    }
