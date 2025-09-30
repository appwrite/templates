"""
Appwrite service module to handle storage cleanup operations.
"""

import os
from appwrite.client import Client
from appwrite.services.storage import Storage
from appwrite.id import ID
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

        while True:
            response = self.storage.list_files(bucket_id, queries)
            files = response.get("files", [])

            for f in files:
                self.storage.delete_file(bucket_id, f["$id"])

            if len(files) == 0:
                break
