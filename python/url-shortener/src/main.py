import os
import json
import nanoid
from appwrite.exceptions import AppwriteException
import utils

# This is your Appwrite function
# It's executed each time we get a request
def main(context):
    database = utils.get_database()

    database_id = os.environ.get("DATABASE_ID")
    collection_id = os.environ.get("COLLECTION_ID")

    if not database_id or not collection_id:
        return context.res.json(
            {'error': 'Missing required environment variables: DATABASE_ID or COLLECTION_ID'},
            status_code=500
        )

    short_id = None
    if context.req.method in ('GET', 'HEAD'):
        path_parts = context.req.path.split('/')
        if path_parts and len(path_parts[-1]) == 7:
            short_id = path_parts[-1]
        
        query = getattr(context.req, 'query', {})
        if not short_id and query and 'id' in query:
             short_id = query['id']

    if short_id:
        try:
            doc = database.get_document(database_id, collection_id, short_id)
            return context.res.redirect(doc['original_url'], 301)
        except AppwriteException as e:
            if e.code == 404:
                return context.res.json({'error': 'URL not found'}, status_code=404)
            return context.res.json({'error': str(e)}, status_code=500)

    try:
        payload = json.loads(context.req.body) if context.req.body else {}
    except json.JSONDecodeError:
        return context.res.json({'error': 'Invalid JSON payload'}, status_code=400)

    if 'short_id' in payload:
        short_id = payload['short_id']
        if not isinstance(short_id, str) or len(short_id) != 7:
            return context.res.json({'error': 'Invalid short_id format'}, status_code=400)
        try:
            doc = database.get_document(database_id, collection_id, short_id)
            return context.res.redirect(doc['original_url'], 301)
        except AppwriteException as e:
            if e.code == 404:
                return context.res.json({'error': 'URL not found'}, status_code=404)
            return context.res.json({'error': str(e)}, status_code=500)

    if 'url' in payload:
        original_url = payload['url'].strip() if isinstance(payload.get('url'), str) else None

        if not original_url or not original_url.startswith(('http://', 'https://')):
            return context.res.json({'error': 'Invalid URL format. Must start with http:// or https://'}, status_code=400)
        if len(original_url) > 2048:
            return context.res.json({'error': 'URL too long (max 2048 characters)'}, status_code=400)
            
        short_id = None
        # --- (FINAL FIX) Wrap the loop in a try...except block ---
        try:
            for _ in range(5):
                candidate_id = nanoid.generate(size=7)
                try:
                    database.create_document(
                        database_id,
                        collection_id,
                        candidate_id,
                        {'original_url': original_url}
                    )
                    short_id = candidate_id
                    break 
                except AppwriteException as e:
                    if e.code == 409:
                        continue
                    raise 
        except AppwriteException as e:
            return context.res.json({'error': f'Database error: {str(e)}'}, status_code=500)

        if not short_id:
            return context.res.json({'error': 'Failed to generate a unique short ID after multiple attempts.'}, status_code=500)

        execution_path = context.req.path
        short_url = f"{context.req.scheme}://{context.req.host}{execution_path}/{short_id}"
        return context.res.json({'short_url': short_url})

    return context.res.json({'error': 'Invalid request.'}, status_code=400)