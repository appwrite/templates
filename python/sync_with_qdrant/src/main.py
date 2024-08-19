import json
import os
from .utils import get_static_file, throw_if_missing
from .appwrite import get_all_documents
from qdrant_client import QdrantClient, models
from openai import OpenAI


def main(context):
    throw_if_missing(
        os.environ,
        [
            "APPWRITE_DATABASE_ID",
            "APPWRITE_COLLECTION_ID",
            "QDRANT_URL",
            "QDRANT_API_KEY",
            "QDRANT_COLLECTION_NAME",
            "OPENAI_API_KEY",
        ],
    )

    if context.req.method == "GET":
        html = get_static_file("index.html")
        context.log("Serving index.html")
        return context.res.text(html, 200, {"content-type": "text/html; charset=utf-8"})

    if context.req.method != "POST":
        context.log("Method not allowed")
        return context.res.json({"ok": False, "error": "Method not allowed"}, 405)

    client = QdrantClient(
        url=os.environ["QDRANT_URL"], api_key=os.environ["QDRANT_API_KEY"]
    )

    openai = OpenAI()

    if context.req.path == "/search":
        context.log("Searching the collection")
        response = openai.embeddings.create(
            input=context.req.body["prompt"], model="text-embedding-3-small"
        )

        search_results = client.search(
            os.environ["QDRANT_COLLECTION_NAME"],
            query_vector=response.data[0].embedding,
            with_payload=True,
            limit=5,
        )

        search_results = [result.model_dump() for result in search_results]

        return context.res.json(
            {
                "searchResults": search_results,
            }
        )

    context.log("Syncing to Qdrant collection")
    documents = get_all_documents(context.req.headers['x-appwrite-key'])
    points = []
    for index, document in enumerate(documents):
        response = openai.embeddings.create(
            input=json.dumps(document), model="text-embedding-3-small"
        )

        point = models.PointStruct(
            id=index, vector=response.data[0].embedding, payload=dict(document)
        )
        points.append(point)

    client.upsert(os.environ["QDRANT_COLLECTION_NAME"], points=points)
    return context.res.text("Sync finished.", 200)