"""
Appwrite service module to handle storage cleanup operations.
"""

import os
from appwrite.client import Client
from appwrite.services.storage import Storage
from appwrite.query import Query
from .utils import get_expiry_date
from concurrent.futures import ThreadPoolExecutor, as_completed


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

            if not files:
                break

            batch_failed = False
            with ThreadPoolExecutor() as executor:
                future_to_file = {
                    executor.submit(self.storage.delete_file, bucket_id, f.get("$id")): f
                    for f in files
                    if f.get("$id")
                }

                for future in as_completed(future_to_file):
                    file_info = future_to_file[future]
                    file_id = file_info.get("$id")
                    try:
                        future.result()
                        deleted_files_count += 1
                    except Exception as e:
                        failed_files.append({"id": file_id, "error": str(e)})
                        batch_failed = True

            if batch_failed:
                break

        if failed_files:
            raise RuntimeError(
                f"Deleted {deleted_files_count} files, but failed to delete {len(failed_files)} files: {failed_files}"
            )
