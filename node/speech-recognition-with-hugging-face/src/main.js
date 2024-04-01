import { HfInference } from '@huggingface/inference';
import { throwIfMissing } from './utils.js';
import AppwriteService from './appwrite.js';

export default async ({ req, res, log, error }) => {
  throwIfMissing(process.env, [
    'HUGGINGFACE_ACCESS_TOKEN',
    'APPWRITE_API_KEY',
  ]);

  const databaseId = process.env.APPWRITE_DATABASE_ID ?? 'ai';
  const collectionId = process.env.APPWRITE_COLLECTION_ID ?? 'speech_recognition';
  const bucketId = process.env.APPWRITE_BUCKET_ID ?? 'speech_recognition';

  if (req.method !== 'POST') {
    return res.send('Method not allowed', 405);
  }

  let fileId = req.body.$id || req.body.fileId;

  if (!fileId) {
    error('Missing fileId');
    return res.send('Bad request', 400);
  }

  if (
    req.body.bucketId &&
    req.body.bucketId != bucketId
  ) {
    error('Invalid bucketId');
    return res.send('Bad request', 400);
  }

  const appwrite = new AppwriteService();

  let file;
  try {
    file = await appwrite.getFile(bucketId, fileId);
  } catch (err) {
    if (err.code === 404) {
      error(err);
      return res.send('File not found', 404);
    }

    error(err);
    return res.send('Bad request', 400);
  }

  const hf = new HfInference(process.env.HUGGINGFACE_ACCESS_TOKEN);

  let result;
  try {
    result = await hf.automaticSpeechRecognition({
      data: file,
      model: 'openai/whisper-large-v3',
    });
  } catch (err) {
    error(err);
    return res.send('Internal server error', 500);
  }

  try {
    await appwrite.createRecognitionEntry(databaseId, collectionId, fileId, result.text);
  } catch (err) {
    error(err);
    return res.send('Internal server error', 500);
  }

  log('Audio ' + fileId + ' recognized', result.text);
  return res.json({
    text: result.text,
  });
};
