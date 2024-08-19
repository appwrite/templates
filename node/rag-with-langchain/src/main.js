import { getStaticFile, throwIfMissing } from './utils.js';
import { Pinecone } from '@pinecone-database/pinecone';
import { Document } from '@langchain/core/documents';
import { formatDocumentsAsString } from 'langchain/util/document';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { PromptTemplate } from '@langchain/core/prompts';
import {
  RunnableSequence,
  RunnablePassthrough,
} from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
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

  if (req.path === '/prompt') {
    if (!req.bodyJson.prompt || typeof req.bodyJson.prompt !== 'string') {
      return res.json(
        { ok: false, error: 'Missing required field `prompt`' },
        400
      );
    }

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex }
    );

    const prompt = PromptTemplate.fromTemplate(
      `Answer the question based with following context:{context}\nQuestion: {question}`
    );

    const chain = RunnableSequence.from([
      {
        context: vectorStore.asRetriever().pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
      },
      prompt,
      new ChatOpenAI(),
      new StringOutputParser(),
    ]);

    const result = await chain.invoke(req.bodyJson.prompt);

    return res.json({ ok: true, completion: result }, 200);
  }

  const appwrite = new AppwriteService(req.headers['x-appwrite-key']);

  log('Fetching documents from Appwrite database...');

  const appwriteDocuments = await appwrite.getAllDocuments(
    process.env.APPWRITE_DATABASE_ID,
    process.env.APPWRITE_COLLECTION_ID
  );

  log(`Fetched ${appwriteDocuments.length} documents.`);

  const documents = appwriteDocuments.map(
    (document) =>
      new Document({
        metadata: { id: document.$id },
        pageContent: Object.entries(document)
          .filter(([key, _]) => !key.startsWith('$'))
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n'),
      })
  );

  log('Indexing documents in Pinecone...');

  await PineconeStore.fromDocuments(documents, new OpenAIEmbeddings(), {
    pineconeIndex,
    maxConcurrency: 5,
  });

  log(`Indexed ${documents.length} documents.`);
  return res.text('Index finished.', 200);
};
