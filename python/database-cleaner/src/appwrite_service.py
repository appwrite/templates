"""
Appwrite service module to handle database cleanup operations.
"""

import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query
from .utils import get_expiry_date


class AppwriteService:
    """
    Service class to interact with Appwrite's database service.
    """

    def __init__(self, api_key: str):
        client = (
            Client()
            .set_endpoint(os.getenv("APPWRITE_FUNCTION_API_ENDPOINT"))
            .set_project(os.getenv("APPWRITE_FUNCTION_PROJECT_ID"))
            .set_key(api_key)
        )
        self.databases = Databases(client)

    def clean_collection(self, database_id: str, collection_id: str):
        """
        Clean up documents from the collection by removing documents older than a
        specified retention period.

        :param database_id: The ID of the database.
        :param collection_id: The ID of the collection to clean.
        """
        queries = [
            Query.less_than("$createdAt", get_expiry_date()),
            Query.limit(25),
        ]

        deleted_documents_count = 0
        failed_documents = []

        while True:
            try:
                response = self.databases.list_documents(
                    database_id=database_id,
                    collection_id=collection_id,
                    queries=queries,
                )
            except Exception as e:
                raise RuntimeError(
                    f"Failed to list documents from collection {collection_id}: {str(e)}"
                ) from e

            documents = (
                response.get("documents", [])
                if isinstance(response, dict)
                else getattr(response, "documents", [])
            )

            if not documents:
                break

            batch_failed = False
            with ThreadPoolExecutor() as executor:
                def delete_doc(doc_id):
                    self.databases.delete_document(
                        database_id=database_id,
                        collection_id=collection_id,
                        document_id=doc_id,
                    )

                future_to_doc = {}
                for doc in documents:
                    doc_id = (
                        doc.get("$id")
                        if isinstance(doc, dict)
                        else getattr(doc, "$id", getattr(doc, "id", None))
                    )
                    if doc_id:
                        future_to_doc[executor.submit(delete_doc, doc_id)] = doc_id

                for future in as_completed(future_to_doc):
                    doc_id = future_to_doc[future]
                    try:
                        future.result()
                        deleted_documents_count += 1
                    except Exception as e:
                        failed_documents.append({"id": doc_id, "error": str(e)})
                        batch_failed = True

            if batch_failed:
                break

        if failed_documents:
            raise RuntimeError(
                f"Deleted {deleted_documents_count} documents, but failed to delete {len(failed_documents)} documents: {failed_documents}"
            )
