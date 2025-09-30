"""
Appwrite service module to handle storage cleanup operations.
"""

import os
from appwrite.client import Client
from appwrite.services.storage import Storage
from appwrite.query import Query
from .utils import get_expiry_date


class AppwriteService:
    """
    Service class to interact with Appwrite's storage service.
    """

    def __init__(self, api_key: str):
        client = (
            Client()
            .set_endpoint(os.getenv("APPWRITE_FUNCTION_API_ENDPOINT"))
            .set_project(os.getenv("APPWRITE_FUNCTION_PROJECT_ID"))
            .set_key(api_key)
        )
        self.storage = Storage(client)

    def clean_bucket(self, bucket_id: str):
        """
        Clean up files from the storage bucket by removing files older than a
        specified retention period.

        :param bucket_id: The ID of the storage bucket to clean.
        """
        queries = [
            Query.less_than("$createdAt", get_expiry_date()),
            Query.limit(25),
        ]

        deleted_files_count = 0
        failed_files = []

        while True:
            try:
                response = self.storage.list_files(bucket_id, queries)
            except Exception as e:
                raise RuntimeError(
                    f"Failed to list files from bucket {bucket_id}: {str(e)}"
                ) from e
            files = response.get("files", [])

            for f in files:
                try:
                    file_id = f.get("$id")
                    if file_id:
                        self.storage.delete_file(bucket_id, file_id)
                        deleted_files_count += 1
                except Exception as e:
                    failed_files.append({"id": file_id, "error": str(e)})

            if not files:
                break

        if failed_files:
            raise RuntimeError(
                f"Deleted {deleted_files_count} files, but failed to delete {len(failed_files)} files: {failed_files}"
            )
