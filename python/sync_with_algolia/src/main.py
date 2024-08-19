import os
from algoliasearch.search_client import SearchClient
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query
from .utils import get_static_file, throw_if_missing, interpolate


def main(context):
    throw_if_missing(
        os.environ,
        [
            "APPWRITE_DATABASE_ID",
            "APPWRITE_COLLECTION_ID",
            "ALGOLIA_APP_ID",
            "ALGOLIA_INDEX_ID",
            "ALGOLIA_ADMIN_API_KEY",
            "ALGOLIA_SEARCH_API_KEY",
        ],
    )

    if context.req.method == "GET":
        html = interpolate(
            get_static_file("index.html"),
            {
                "ALGOLIA_APP_ID": os.environ["ALGOLIA_APP_ID"],
                "ALGOLIA_INDEX_ID": os.environ["ALGOLIA_INDEX_ID"],
                "ALGOLIA_SEARCH_API_KEY": os.environ["ALGOLIA_SEARCH_API_KEY"],
            },
        )
        return context.res.text(html, 200, {"Content-Type": "text/html; charset=utf-8"})

    client = (
        Client()
        .set_endpoint(os.environ["APPWRITE_FUNCTION_API_ENDPOINT"])
        .set_project(os.environ["APPWRITE_FUNCTION_PROJECT_ID"])
        .set_key(context.req.headers["x-appwrite-key"])
    )
    database = Databases(client)

    algolia = SearchClient.create(
        os.environ["ALGOLIA_APP_ID"], os.environ["ALGOLIA_ADMIN_API_KEY"]
    )
    index = algolia.init_index(os.environ["ALGOLIA_INDEX_ID"])

    cursor = None
    while True:
        queries = [Query.limit(100)]
        if cursor is not None:
            queries.append(Query.cursor_after(cursor))

        response = database.list_documents(
            os.environ["APPWRITE_DATABASE_ID"],
            os.environ["APPWRITE_COLLECTION_ID"],
            queries,
        )

        if len(response.documents) > 0:
            cursor = response.documents[len(response.documents) - 1]["$id"]
        else:
            context.log("No more documents found.")
            cursor = None
            break

        context.log(f"Syncing chunk of {len(response.documents)} documents...")
        documents_with_object_ids = [
            {"objectID": document["$id"], **document} for document in response.documents
        ]
        index.save_objects(documents_with_object_ids)

        if cursor is None:
            break

    context.log("Sync finished.")

    return context.res.text("Sync finished.", 200)
