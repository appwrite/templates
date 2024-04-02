import fetch from 'node-fetch';
import { throwIfMissing } from './utils.js';
import AppwriteService from './appwrite.js';
import { ID } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  throwIfMissing(process.env, [
    'HUGGINGFACE_ACCESS_TOKEN',
    'APPWRITE_API_KEY',
    'APPWRITE_FUNCTION_PROJECT_ID',
  ]);

  const databaseId = process.env.APPWRITE_DATABASE_ID ?? 'ai';
  const collectionId = process.env.APPWRITE_COLLECTION_ID ?? 'text_to_speech';
  const bucketId = process.env.APPWRITE_BUCKET_ID ?? 'text_to_speech';

  if (req.method !== 'POST') {
    return res.send({ ok: false, error: 'Method not allowed' }, 405);
  }

  if (!req.body.text || typeof req.body.text !== 'string') {
    return res.send({ ok: false, error: 'Missing required field `text`' }, 400);
  }

  const response = await fetch(
    'https://api-inference.huggingface.co/models/espnet/kan-bayashi_ljspeech_vits',
    {
      headers: {
        Authorization: 'Bearer ' + process.env.HUGGINGFACE_ACCESS_TOKEN,
      },
      method: 'POST',
      body: JSON.stringify({
        inputs: req.body.text,
      }),
    }
  );

  if (!response.ok) {
    error(await response.text());
    return res.send({ ok: false, error: 'Failed to process text' }, 500);
  }

  const blob = await response.blob();

  const appwrite = new AppwriteService();
  let file;
  try {
    file = await appwrite.createFile(bucketId, ID.unique(), blob);
  } catch (err) {
    error(err);
    return res.json({ ok: false, error: 'Failed to create file' }, 500);
  }

  let document;
  try {
    document = await appwrite.updateOrCreateTTSEntry(
      databaseId,
      collectionId,
      req.body.$id ?? ID.unique(),
      file.$id,
      req.body.text
    );
  } catch (err) {
    error(err);
    return res.json({ ok: false, error: 'Failed to update document' }, 500);
  }

  log('Document ' + document.$id + ' processed');
  return res.json({
    ok: true,
    $id: document.$id,
    tts: file.$id,
  });
};
