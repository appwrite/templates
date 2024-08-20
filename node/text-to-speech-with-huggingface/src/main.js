import fetch from 'node-fetch';
import { throwIfMissing } from './utils.js';
import AppwriteService from './appwrite.js';

const HUGGINGFACE_API = 'https://api-inference.huggingface.co';

export default async ({ req, res, error }) => {
  throwIfMissing(process.env, ['HUGGINGFACE_ACCESS_TOKEN']);

  const bucketId = process.env.APPWRITE_BUCKET_ID ?? 'generated_speech';

  if (req.method !== 'POST') {
    return res.json({ ok: false, error: 'Method not allowed' }, 405);
  }

  if (!req.bodyJson.text || typeof req.bodyJson.text !== 'string') {
    return res.json({ ok: false, error: 'Missing required field `text`' }, 400);
  }

  const response = await fetch(
    `${HUGGINGFACE_API}/models/espnet/kan-bayashi_ljspeech_vits`,
    {
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_ACCESS_TOKEN}`,
      },
      method: 'POST',
      body: JSON.stringify({
        inputs: req.bodyJson.text,
      }),
    }
  );

  if (!response.ok) {
    error(await response.text());
    return res.json({ ok: false, error: 'Failed to process text' }, 500);
  }

  const blob = await response.blob();

  const appwrite = new AppwriteService(req.headers['x-appwrite-key']);
  const file = await appwrite.createFile(bucketId, blob);

  return res.json({
    ok: true,
    fileId: file.$id,
  });
};
