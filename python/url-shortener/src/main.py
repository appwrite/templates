import os
import json
import nanoid
from appwrite.services.databases import Databases
from appwrite.query import Query
from . import utils

# This is your Appwrite function
# It's executed each time we get a request
def main(context):
    # Get Appwrite's database client
    database = utils.get_database()

    # Database and collection IDs
    database_id = os.environ.get("DATABASE_ID")
    collection_id = os.environ.get("COLLECTION_ID")

    # The payload will contain 'url' to shorten or 'short_id' to redirect
    payload = json.loads(context.req.body)

    # Action: Create a short URL
    if 'url' in payload:
        original_url = payload['url']
        short_id = nanoid.generate(size=7)

        try:
            database.create_document(
                database_id,
                collection_id,
                short_id,
                {'original_url': original_url}
            )
            short_url = f"{context.req.scheme}://{context.req.host}/v1/databases/{database_id}/collections/{collection_id}/documents/{short_id}"
            return context.res.json({'short_url': short_url})
        except Exception as e:
            return context.res.json({'error': str(e)}, status_code=500)

    # Action: Redirect to the original URL
    if 'short_id' in payload:
        short_id = payload['short_id']

        try:
            # Find the document with the given short_id
            result = database.list_documents(
                database_id,
                collection_id,
                [Query.equal("$id", short_id)]
            )

            if result['total'] > 0:
                original_url = result['documents'][0]['original_url']
                return context.res.redirect(original_url, 301)
            else:
                return context.res.json({'error': 'URL not found'}, status_code=404)

        except Exception as e:
            return context.res.json({'error': str(e)}, status_code=500)

    # If no valid action is found
    return context.res.json({'error': 'Invalid request. Provide either a "url" or a "short_id".'}, status_code=400)