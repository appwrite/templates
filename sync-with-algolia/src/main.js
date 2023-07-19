import { Client, Databases, Query } from 'node-appwrite';
import algoliasearch from 'algoliasearch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import EnvironmentService from './environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticFolder = path.join(__dirname, '../static');

/**
 * @param {string} template
 * @param {Record<string, string>} values
 * @returns {string}
 */
function interpolate(template, values) {
  return template.replace(/{{([^}]+)}}/g, (_, key) => values[key]);
}

export default async ({ req, res, log }) => {
  const {
    ALGOLIA_APP_ID,
    ALGOLIA_ADMIN_API_KEY,
    ALGOLIA_INDEX_ID,
    ALGOLIA_SEARCH_API_KEY,
    APPWRITE_API_KEY,
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTION_ID,
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
  } = EnvironmentService();

  if (req.method === 'GET') {
    const template = fs
      .readFileSync(path.join(staticFolder, 'index.html'))
      .toString();

    const html = interpolate(template, {
      ALGOLIA_APP_ID,
      ALGOLIA_INDEX_ID,
      ALGOLIA_SEARCH_API_KEY,
    });

    return res.send(html, 200, { 'Content-Type': 'text/html; charset=utf-8' });
  }

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);

  const algolia = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);
  const algoliaIndex = algolia.initIndex(ALGOLIA_INDEX_ID);

  let cursor = null;

  do {
    const queries = [Query.limit(100)];

    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID,
      queries
    );

    if (response.documents.length > 0) {
      cursor = response.documents[response.documents.length - 1].$id;
    } else {
      log(`No more documents found.`);
      cursor = null;
      break;
    }

    log(`Syncing chunk of ${response.documents.length} documents ...`);

    const records = response.documents.map((document) => ({
      ...document,
      objectID: document.$id,
    }));
    await algoliaIndex.saveObjects(records);
  } while (cursor !== null);

  log('Sync finished.');

  return res.empty();
};
