import { getStaticFile, throwIfMissing } from './utils.js';
import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';
import AppwriteService from './appwrite.js';

export default async ({ req, res, log }) => {
  throwIfMissing(process.env, [
    'APPWRITE_DATABASE_ID',
    'APPWRITE_COLLECTION_ID',
    'QDRANT_URL',
    'QDRANT_API_KEY',
    'QDRANT_COLLECTION_NAME',
    'OPENAI_API_KEY',
  ]);

  if (req.method === 'GET') {
    const html = getStaticFile('index.html');
    return res.text(html, 200, { 'Content-Type': 'text/html; charset=utf-8' });
  }

  if (req.method !== 'POST') {
    return res.json({ ok: false, error: 'Method not allowed' }, 405);
  }

  const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
  });

  const openai = new OpenAI();

  if (req.path === '/search') {
    const queryEmbedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: req.bodyJson.prompt,
    });

    const searchResults = await client.search(
      process.env.QDRANT_COLLECTION_NAME,
      {
        vector: queryEmbedding.data[0].embedding,
        limit: 5,
        with_payload: true,
      }
    );

    return res.json({
      searchResults,
    });
  }

  log('Fetching documents from Appwrite...');
  const appwrite = new AppwriteService(req.headers['x-appwrite-key']);
  const documents = await appwrite.getAllDocuments(
    process.env.APPWRITE_DATABASE_ID,
    process.env.APPWRITE_COLLECTION_ID
  );
  log(`Fetched ${documents.length} documents.`);

  log('Create embeddings...');
  const points = await Promise.all(
    documents.map(async (document, index) => {
      const record = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: JSON.stringify(document, null, 2),
      });
      return {
        id: index,
        vector: record.data[0].embedding,
        payload: document,
      };
    })
  );
  log(`Created ${points.length} embeddings.`);

  log('Syncing points to Qdrant...');

  await client.upsert(process.env.QDRANT_COLLECTION_NAME, {
    points,
  });
  return res.text('Sync finished.', 200);
};
