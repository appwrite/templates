import json
import os
from .utils import get_static_file, throw_if_missing, get_all_documents
from qdrant_client import QdrantClient, models
from openai import OpenAI


def main(context):
    throw_if_missing(
        os.environ,
        [
            "APPWRITE_API_KEY",
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
        return context.res.send(html, 200, {"content-type": "text/html; charset=utf-8"})

    if context.req.method != "POST":
        return context.res.send({"ok": False, "error": "Method not allowed"}, 405)

    client = QdrantClient(
        url=os.environ["QDRANT_URL"], api_key=os.environ["QDRANT_API_KEY"]
    )

    openai = OpenAI()

    if context.req.path == "/search":
        response = openai.embeddings.create(
            input=context.req.body["prompt"], model="text-embedding-3-small"
        )

        search_results = client.search(
            os.environ["QDRANT_COLLECTION_NAME"],
            query_vector=response.data[0].embedding,
            with_payload=True,
            limit=5,
        )

        return context.res.json(
            {
                "searchResults": search_results,
            }
        )

    documents = get_all_documents()
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
    return context.res.send("Sync finished.", 200)
