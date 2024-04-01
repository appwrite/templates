import { Client, Databases, Query } from 'node-appwrite';
import { getStaticFile, throwIfMissing } from './utils.js';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

export default async ({ req, res, log }) => {
  throwIfMissing(process.env, [
    'APPWRITE_API_KEY',
    'APPWRITE_DATABASE_ID',
    'APPWRITE_COLLECTION_ID',
    'PINECONE_API_KEY',
    'PINECONE_INDEX_ID',
    'OPENAI_API_KEY',
  ]);

  if (req.method === 'GET') {
    const html = getStaticFile('index.html');
    return res.send(html, 200, { 'Content-Type': 'text/html; charset=utf-8' });
  }

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  const index = pinecone.index(process.env.PINECONE_INDEX_ID);

  const client = new Client()
    .setEndpoint(
      process.env.APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1'
    )
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  if (req.path === '/search') {
    const queryEmbedding = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: req.body.prompt,
    });

    const searchResults = await index.query({
      vector: queryEmbedding.data[0].embedding,
      topK: 5,
    });

    return res.json(searchResults);
  }

  let cursor = null;
  do {
    const queries = [Query.limit(100)];

    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const { documents } = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_ID,
      queries
    );

    if (documents.length === 0) {
      log(`No more documents found.`);
      break;
    }

    cursor = documents[documents.length - 1].$id;

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

    await index.upsert(embeddings);

    log(`Synced ${documents.length} documents.`);
  } while (cursor);

  log('Sync finished.');

  return res.send('Sync finished.', 200);
};
