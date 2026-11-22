import os
from .appwrite_service import AppwriteService
from .utils import throw_if_missing


def main(context):
    try:
        throw_if_missing(
            os.environ,
            [
                "APPWRITE_DATABASE_ID",
                "APPWRITE_COLLECTION_ID",
                "RETENTION_PERIOD_DAYS",
            ],
        )
    except ValueError as e:
        return context.res.json({"error": str(e)}, 500)

    api_key = context.req.headers.get("x-appwrite-key")
    if not api_key:
        return context.res.json(
            {"error": "Missing API key in x-appwrite-key header"}, 401
        )

    appwrite = AppwriteService(api_key)

    try:
        appwrite.clean_collection(
            os.environ["APPWRITE_DATABASE_ID"],
            os.environ["APPWRITE_COLLECTION_ID"],
        )
        context.log("Cleaning finished!")
        return context.res.json({"message": "Collection cleaned"}, 200)
    except ValueError as e:
        return context.res.json({"error": str(e)}, 400)
    except Exception as e:
        context.error(f"Error cleaning collection: {e}")
        return context.res.json({"error": "Failed to clean collection"}, 500)
