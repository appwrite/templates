import os


def is_origin_permitted(req):
    """
    Returns true if the origin is allowed to make requests to this endpoint

    Parameters:
        req: Request object

    Returns:
        (bool): True if the origin is allowed, False otherwise
    """
    if os.getenv("ALLOWED_ORIGINS", "*") == "*":
        return True

    allowed_origins_list = os.getenv("ALLOWED_ORIGINS").split(",")
    return req.headers.get("Origin") in allowed_origins_list


def get_cors_headers(req):
    """
    Returns the CORS headers for the request

    Parameters:
        req: Request object

    Returns:
        (dict): CORS headers
    """
    if "origin" not in req.headers:
        return {}

    return {
        "Access-Control-Allow-Origin": "*"
        if os.getenv("ALLOWED_ORIGINS", "*") == "*"
        else req.headers["origin"],
    }
