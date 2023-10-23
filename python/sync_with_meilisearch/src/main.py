import os
from appwrite.client import Client
from appwrite.services.databases import Databases
from meilisearch import Client as MeiliClient
from .utils import get_static_file, interpolate, throw_if_missing

def main(context):
    throw_if_missing(os.environ, [
        'APPWRITE_API_KEY',
        'APPWRITE_DATABASE_ID',
        'APPWRITE_COLLECTION_ID',
        'MEILISEARCH_ENDPOINT',
        'MEILISEARCH_INDEX_NAME',
        'MEILISEARCH_ADMIN_API_KEY',
        'MEILISEARCH_SEARCH_API_KEY',
    ])

    if context.req.method == 'GET':
        html = interpolate(get_static_file('index.html'), {
            'MEILISEARCH_ENDPOINT': os.environ['MEILISEARCH_ENDPOINT'],
            'MEILISEARCH_INDEX_NAME': os.environ['MEILISEARCH_INDEX_NAME'],
            'MEILISEARCH_SEARCH_API_KEY': os.environ['MEILISEARCH_SEARCH_API_KEY'],
        })

        return context.res.send(html, 200, {'content-type': 'text/html; charset=utf-8'})

    client = Client()
    client.set_endpoint(os.environ.get('APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1'))
    client.set_project(os.environ['APPWRITE_FUNCTION_PROJECT_ID'])
    client.set_key(os.environ['APPWRITE_API_KEY'])

    databases = Databases(client)

    meilisearch = MeiliClient(os.environ['MEILISEARCH_ENDPOINT'], os.environ['MEILISEARCH_ADMIN_API_KEY'])
    index = meilisearch.index(os.environ['MEILISEARCH_INDEX_NAME'])

    cursor = None

    while True:
        queries = [{'limit': 100}]

        if cursor:
            queries.append({'cursorAfter': cursor})

        response = databases.list_documents(
            os.environ['APPWRITE_DATABASE_ID'],
            os.environ['APPWRITE_COLLECTION_ID'],
            queries
        )

        documents = response['documents']

        if len(documents) > 0:
            cursor = documents[-1]['$id']
        else:
            context.log('No more documents found.')
            cursor = None
            break

        context.log(f'Syncing chunk of {len(documents)} documents...')
        index.add_documents(documents, {'primaryKey': '$id'})

    context.log('Sync finished.')

    return context.res.send('Sync finished.', 200)
