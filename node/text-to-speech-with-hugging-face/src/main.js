import fetch from 'node-fetch';
import { throwIfMissing } from './utils.js';
import AppwriteService from './appwrite.js';
import { ID } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  throwIfMissing(process.env, ['HUGGINGFACE_API_TOKEN', 'APPWRITE_API_KEY', 'APPWRITE_FUNCTION_PROJECT_ID']);

  const databaseId = process.env.APPWRITE_DATABASE_ID ?? 'ai';
  const collectionId = process.env.APPWRITE_COLLECTION_ID ?? 'text_to_speech';
  const bucketId = process.env.APPWRITE_BUCKET_ID ?? 'text_to_speech';

  if (req.method !== 'POST') {
    return res.send('Method Not Allowed', 405);
  }

  const appwrite = new AppwriteService();

  const data = req.body;

  if (!data.text) {
    return res.send('Bad request', 400);
  }

  const response = await fetch(
    'https://api-inference.huggingface.co/models/espnet/kan-bayashi_ljspeech_vits',
    {
      headers: {
        Authorization: 'Bearer ' + process.env.HUGGINGFACE_API_TOKEN,
      },
      method: 'POST',
      body: JSON.stringify({
        inputs: data.text,
      }),
    }
  );

  if (!response.ok) {
    error(await response.text());
    return res.send('Internal server error', 500);
  }

  const result = await response.blob();

  let file;
  try {
    file = await appwrite.createFile(bucketId, ID.unique(), result);
  } catch (err) {
    error(err);
    return res.send('Internal server error', 500);
  }

  let document;
  try {
    document = await appwrite.updateOrCreateTTSEntry(
      databaseId,
      collectionId,
      data.$id ?? ID.unique(),
      file.$id,
      data.text
    );
  } catch (err) {
    error(err);
    return res.send('Internal server error', 500);
  }

  log('Document ' + document.$id + ' processed');
  return res.json({
    $id: document.$id,
    tts: file.$id,
  });
};
