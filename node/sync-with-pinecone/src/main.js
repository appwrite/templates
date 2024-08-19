import { getStaticFile, throwIfMissing } from './utils.js';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import AppwriteService from './appwrite.js';

export default async ({ req, res, log }) => {
  throwIfMissing(process.env, [
    'APPWRITE_DATABASE_ID',
    'APPWRITE_COLLECTION_ID',
    'PINECONE_API_KEY',
    'PINECONE_INDEX_ID',
    'OPENAI_API_KEY',
  ]);

  if (req.method === 'GET') {
    const html = getStaticFile('index.html');
    return res.text(html, 200, { 'Content-Type': 'text/html; charset=utf-8' });
  }

  if (req.method !== 'POST') {
    return res.json({ ok: false, error: 'Method not allowed' }, 405);
  }

  const pinecone = new Pinecone();
  const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_ID);

  const openai = new OpenAI();

  if (req.path === '/search') {
    const queryEmbedding = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: req.bodyJson.prompt,
    });

    const searchResults = await pineconeIndex.query({
      vector: queryEmbedding.data[0].embedding,
      topK: 5,
    });

    return res.json(searchResults);
  }

  log('Fetching documents from Appwrite...');
  const appwrite = new AppwriteService(req.headers['x-appwrite-key']);
  const documents = await appwrite.getAllDocuments(
    process.env.APPWRITE_DATABASE_ID,
    process.env.APPWRITE_COLLECTION_ID
  );
  log(`Fetched ${documents.length} documents.`);

  log('Create embeddings...');
  const embeddings = await Promise.all(
    documents.map(async (document) => {
      const record = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: JSON.stringify(document),
      });
      return {
        id: document.$id,
        values: record.data[0].embedding,
        metadata: document,
      };
    })
  );
  log(`Created ${embeddings.length} embeddings.`);

  log('Syncing embeddings with Pinecone...');
  await pineconeIndex.upsert(embeddings);
  return res.text('Sync finished.', 200);
};
