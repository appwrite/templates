import { Client, Databases, Query } from 'node-appwrite';
import algoliasearch from 'algoliasearch';
import { getStaticFile, interpolate, throwIfMissing } from './utils.js';

export default async ({ req, res, log }) => {
  throwIfMissing(process.env, [
    'APPWRITE_API_KEY',
    'APPWRITE_DATABASE_ID',
    'APPWRITE_COLLECTION_ID',
    'ALGOLIA_APP_ID',
    'ALGOLIA_INDEX_ID',
    'ALGOLIA_ADMIN_API_KEY',
    'ALGOLIA_SEARCH_API_KEY',
  ]);

  if (req.method === 'GET') {
    const html = interpolate(getStaticFile('index.html'), {
      ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
      ALGOLIA_INDEX_ID: process.env.ALGOLIA_INDEX_ID,
      ALGOLIA_SEARCH_API_KEY: process.env.ALGOLIA_SEARCH_API_KEY,
    });

    return res.send(html, 200, { 'Content-Type': 'text/html; charset=utf-8' });
  }

  const client = new Client()
    .setEndpoint(
      process.env.APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1'
    )
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  const algolia = algoliasearch(
    process.env.ALGOLIA_APP_ID,
    process.env.ALGOLIA_ADMIN_API_KEY
  );
  const index = algolia.initIndex(process.env.ALGOLIA_INDEX_ID);

  let cursor = null;
  do {
    const queries = [Query.limit(100)];

    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_ID,
      queries
    );

    if (response.documents.length > 0) {
      cursor = response.documents[response.documents.length - 1].$id;
    } else {
      log('No more documents found.');
      cursor = null;
      break;
    }

    log(`Syncing chunk of ${response.documents.length} documents...`);

    const records = response.documents.map(({ $id, ...document }) => ({
      ...document,
      objectID: $id,
    }));

    await index.saveObjects(records);
  } while (cursor !== null);

  log('Sync finished.');

  return res.send('Sync finished.', 200);
};
