import os
import json
import nanoid
from appwrite.services.databases import Databases
from appwrite.query import Query
from appwrite.exceptions import AppwriteException
from . import utils

# This is your Appwrite function
# It's executed each time we get a request
def main(context):
    # Get Appwrite's database client
    database = utils.get_database()

    # --- (Suggestion 2) Validate Database Environment Variables ---
    database_id = os.environ.get("DATABASE_ID")
    collection_id = os.environ.get("COLLECTION_ID")

    if not database_id or not collection_id:
        return context.res.json(
            {'error': 'Missing required environment variables: DATABASE_ID or COLLECTION_ID'},
            status_code=500
        )

    # --- (Suggestion 4, Part 1) Handle Redirection from URL Path ---
    # Check for short_id in the path, e.g. /v1/functions/.../executions/.../6aT8bC1
    path_parts = context.req.path.split('/')
    short_id_from_path = path_parts[-1] if len(path_parts) > 1 and len(path_parts[-1]) == 7 else None

    if context.req.method == 'GET' and short_id_from_path:
        try:
            result = database.list_documents(
                database_id,
                collection_id,
                [Query.equal("$id", short_id_from_path)]
            )
            if result['total'] > 0:
                original_url = result['documents'][0]['original_url']
                return context.res.redirect(original_url, 301)
            else:
                return context.res.json({'error': 'URL not found'}, status_code=404)
        # --- (Suggestion 5) Specific Exception Handling ---
        except AppwriteException as e:
            return context.res.json({'error': str(e)}, status_code=500)

    # --- (Suggestion 1) Handle JSON Parsing Errors ---
    try:
        payload = json.loads(context.req.body) if context.req.body else {}
    except json.JSONDecodeError:
        return context.res.json({'error': 'Invalid JSON payload'}, status_code=400)

    # --- Action: Create a short URL ---
    if 'url' in payload:
        original_url = payload['url']

        # --- (Suggestion 3) Add URL Validation ---
        if not original_url or not isinstance(original_url, str):
            return context.res.json({'error': 'Invalid URL format'}, status_code=400)
        if len(original_url) > 2048:
            return context.res.json({'error': 'URL too long (max 2048 characters)'}, status_code=400)
        if not original_url.startswith(('http://', 'https://')):
            return context.res.json({'error': 'URL must start with http:// or https://'}, status_code=400)

        short_id = nanoid.generate(size=7)

        try:
            database.create_document(
                database_id,
                collection_id,
                short_id,
                {'original_url': original_url}
            )
            # --- (Suggestion 4, Part 2) Construct Correct short_url ---
            # It should point to the function itself
            execution_path = context.req.path
            short_url = f"{context.req.scheme}://{context.req.host}{execution_path}/{short_id}"
            return context.res.json({'short_url': short_url})
        # --- (Suggestion 5) Specific Exception Handling ---
        except AppwriteException as e:
            return context.res.json({'error': str(e)}, status_code=500)

    return context.res.json({'error': 'Invalid request. Provide a "url" in the JSON body to shorten.'}, status_code=400)