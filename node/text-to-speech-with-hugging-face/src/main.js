import { HfInference } from '@huggingface/inference';
import { throwIfMissing } from './utils.js';
import AppwriteService from './appwrite.js';
import { ID } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  throwIfMissing(process.env, [
    'HUGGINGFACE_ACCESS_TOKEN',
    'APPWRITE_API_KEY',
    'APPWRITE_FUNCTION_PROJECT_ID',
  ]);

  if (req.method !== 'POST') {
    return res.send('Method not allowed', 405);
  }

  if (!req.body.text || typeof req.body.text !== 'string') {
    return res.json({ ok: false, error: 'Missing required field `text`' }, 400);
  }

  // Generate audio file with Hugging Face
  const hf = new HfInference(process.env.HUGGINGFACE_ACCESS_TOKEN);
  let blob;
  try {
    blob = await hf.textToSpeech({
      model: 'facebook/wav2vec2-large-960h-lv60-self',
      inputs: req.body.text,
    });
  } catch (err) {
    error('Failed to generate audio: ' + err);
    return res.json({ ok: false, error: 'Internal server error' }, 500);
  }

  // Upload audio file to Appwrite Storage
  const appwrite = new AppwriteService();
  let file;
  try {
    file = await appwrite.createFile(
      process.env.APPWRITE_BUCKET_ID ?? 'text_to_speech',
      ID.unique(),
      blob
    );
  } catch (err) {
    error('Failed to upload audio file: ' + err);
    return res.json({ ok: false, error: 'Internal server error' }, 500);
  }

  // Save document in Appwrite database
  let document;
  try {
    document = await appwrite.updateOrCreateTTSEntry(
      process.env.APPWRITE_DATABASE_ID ?? 'ai',
      process.env.APPWRITE_COLLECTION_ID ?? 'text_to_speech',
      req.body.$id ?? ID.unique(),
      file.$id,
      req.body.text
    );
  } catch (err) {
    error('Failed to save document: ' + err);
    return res.send({ ok: false, error: 'Internal server error' }, 500);
  }

  log('Document ' + document.$id + ' processed');
  return res.json({
    $id: document.$id,
    tts: file.$id,
  });
};
