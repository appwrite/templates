import * as fal from '@fal-ai/serverless-client';
import { getStaticFile, throwIfMissing } from './utils.js';

export default async ({ req, res, error }) => {
  throwIfMissing(process.env, ['FAL_API_KEY']);

  if (req.method === 'GET') {
    return res.send(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
  }

  if (!req.body.prompt || typeof req.body.prompt !== 'string') {
    return res.json(
      { ok: false, error: 'Missing required field `prompt`' },
      400
    );
  }

  fal.config({ credentials: process.env.FAL_API_KEY });

  try {
    const result = await fal.subscribe('fal-ai/fast-sdxl', {
      input: {
        prompt: req.body.prompt,
      },
    });
    return res.json({ ok: true, src: result.images[0].url });
  } catch (e) {
    error(e);
    return res.json({ ok: false, error: 'Failed to generate image' }, 500);
  }
};
