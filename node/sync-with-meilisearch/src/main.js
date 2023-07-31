import { Client, Databases, Query } from 'node-appwrite';
import { fetch } from 'undici';
import { getStaticFile, interpolate, throwIfMissing } from './utils.js';

export default async ({ req, res, log }) => {
  throwIfMissing(process.env, [
    'APPWRITE_ENDPOINT',
    'APPWRITE_API_KEY',
    'APPWRITE_PROJECT_ID',
    'APPWRITE_DATABASE_ID',
    'APPWRITE_COLLECTION_ID',
    'MEILISEARCH_ENDPOINT',
    'MEILISEARCH_INDEX_NAME',
    'MEILISEARCH_SEARCH_API_KEY',
  ]);

  if (req.method === 'GET') {
    const html = interpolate(getStaticFile('index.html'), {
      MEILISEARCH_ENDPOINT: process.env.MEILISEARCH_ENDPOINT,
      MEILISEARCH_INDEX_NAME: process.env.MEILISEARCH_INDEX_NAME,
      MEILISEARCH_SEARCH_API_KEY: process.env.MEILISEARCH_SEARCH_API_KEY,
    });

    return res.send(html, 200, { 'Content-Type': 'text/html; charset=utf-8' });
  }

  const client = new Client()
    .setEndpoint(
      process.env.APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1'
    )
    .setProject(
      process.env.APPWRITE_PROJECT_ID ??
        process.env.APPWRITE_FUNCTION_PROJECT_ID ??
        ''
    )
    .setKey(process.env.APPWRITE_API_KEY ?? '');

  const databases = new Databases(client);

  let cursor = null;

  do {
    const queries = [Query.limit(100)];

    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const { documents } = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID ?? '',
      process.env.APPWRITE_COLLECTION_ID ?? '',
      queries
    );

    if (documents.length > 0) {
      cursor = documents[documents.length - 1].$id;
    } else {
      log(`No more documents found.`);
      cursor = null;
      break;
    }

    log(`Syncing chunk of ${documents.length} documents ...`);

    await fetch(
      `${process.env.MEILISEARCH_ENDPOINT}/indexes/${process.env.MEILISEARCH_INDEX_NAME}/documents?primaryKey=$id`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MEILISEARCH_ADMIN_API_KEY}`,
        },
        body: JSON.stringify(documents),
      }
    );
  } while (cursor !== null);

  log('Sync finished.');

  return res.empty();
};
