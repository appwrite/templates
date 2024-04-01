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

  if (req.method !== 'POST') {
    return res.send('Method not allowed', 405);
  }

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_ID);

  if (req.path === '/prompt') {
    if (!req.body.prompt && typeof req.body.prompt !== 'string') {
      return res.send('Prompt is required.', 400);
    }

    const model = new ChatOpenAI({
      configuration: {
        apiKey: process.env.OPENAI_API_KEY,
      },
    });

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      {
        pineconeIndex,
      }
    );

    const retriever = vectorStore.asRetriever();

    const prompt =
      PromptTemplate.fromTemplate(`Answer the question based with following context:
  {context}
  
  Question: {question}`);

    const chain = RunnableSequence.from([
      {
        context: retriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
      },
      prompt,
      model,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke(req.body.prompt);

    return res.json({ ok: true, completion: result }, 200);
  }

  const appwrite = new AppwriteService();

  log('Fetching documents from Appwrite database...');

  const rawDocuments = await appwrite.getAllDocuments(
    process.env.APPWRITE_DATABASE_ID,
    process.env.APPWRITE_COLLECTION_ID
  );

  const documents = rawDocuments.map(
    (document) =>
      new Document({
        metadata: { id: document.$id },
        pageContent: Object.entries(document)
          .filter(([key, _]) => !key.startsWith('$'))
          .map(([_, value]) => value)
          .join(' '),
      })
  );

  log(`Fetched ${rawDocuments.length} documents.`);
  log('Indexing documents in Pinecone...');

  await PineconeStore.fromDocuments(documents, new OpenAIEmbeddings(), {
    pineconeIndex,
    maxConcurrency: 5,
  });

  log(`Indexed ${documents.length} documents.`);
  return res.send('Index finished.', 200);
};
