import { fetch } from 'undici';
import { throwIfMissing } from './utils.js';
import AppwriteService from './appwrite.js';

const HUGGINGFACE_API = 'https://api-inference.huggingface.co';

export default async ({ req, res, error }) => {
  throwIfMissing(process.env, ['HUGGINGFACE_ACCESS_TOKEN']);

  const bucketId = process.env.APPWRITE_BUCKET_ID ?? 'generated_music';

  if (req.method !== 'POST') {
    return res.json({ ok: false, error: 'Method not allowed' }, 405);
  }

  if (!req.body.prompt || typeof req.body.prompt !== 'string') {
    return res.json(
      { ok: false, error: 'Missing required field `prompt`' },
      400
    );
  }

  const response = await fetch(
    `${HUGGINGFACE_API}/models/facebook/musicgen-large`,
    {
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_ACCESS_TOKEN}`,
      },
      method: 'POST',
      body: JSON.stringify({
        inputs: req.body.prompt,
      }),
    }
  );

  if (!response.ok) {
    error(await response.text());
    return res.json({ ok: false, error: 'Failed to process text' }, 500);
  }

  const blob = await response.blob();

  const appwrite = new AppwriteService();
  // @ts-ignore
  const file = await appwrite.createFile(bucketId, blob);

  return res.json({
    ok: true,
    fileId: file.$id,
  });
};
