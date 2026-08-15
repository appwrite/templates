import os
from appwrite.client import Client
from appwrite.models import Document
from appwrite.services.databases import Databases
from appwrite.query import Query

def get_all_documents(api_key) -> list[Document]:
    client = Client()
    client.set_endpoint(os.environ.get("APPWRITE_FUNCTION_API_ENDPOINT"))
    client.set_project(os.environ["APPWRITE_FUNCTION_PROJECT_ID"])
    client.set_key(api_key)

    databases = Databases(client)

    cursor = None
    cumulative: list[Document] = []

    while True:
        queries = [Query.limit(1000)]
        if cursor:
            queries.append(Query.cursor_after(cursor))

        response = databases.list_documents(
            os.environ["APPWRITE_DATABASE_ID"],
            os.environ["APPWRITE_COLLECTION_ID"],
            queries,
        )

        documents: list[Document] = response.documents

        if len(documents) > 0:
            cursor = documents[-1].id
        else:
            break
        cumulative.extend(documents)

    return cumulative
