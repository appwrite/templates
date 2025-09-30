import os
from .appwrite import AppwriteService
from .utils import throw_if_missing


def main(context):
    throw_if_missing(os.environ, ["RETENTION_PERIOD_DAYS", "APPWRITE_BUCKET_ID"])

    api_key = context.req.headers["x-appwrite-key"]

    if not api_key:
        return context.res.json(
            {"error": "Missing API key in x-appwrite-key header"}, 401
        )

    appwrite = AppwriteService(api_key)

    try:
        appwrite.clean_bucket(os.environ["APPWRITE_BUCKET_ID"])
        return context.res.text("Buckets cleaned", 200)
    except ValueError as e:
        return context.res.json({"error": str(e)}, 400)
    except Exception as e:
        print(f"Error cleaning bucket: {e}")
        return context.res.json({"error": "Failed to clean bucket"}, 500)
