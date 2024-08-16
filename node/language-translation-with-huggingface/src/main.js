import { HfInference } from '@huggingface/inference';
import { getStaticFile, throwIfMissing } from './utils.js';

export default async ({ req, res }) => {
  throwIfMissing(process.env, ['HUGGINGFACE_ACCESS_TOKEN']);

  if (req.method === 'GET') {
    return res.text(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
  }

  if (req.method !== 'POST') {
    return res.json({ ok: false, error: 'Method not allowed.' }, 405);
  }

  if (!req.bodyJson.source || typeof req.bodyJson.source !== 'string') {
    return res.json(
      { ok: false, error: 'Missing required field `source`' },
      400
    );
  }

  const hf = new HfInference(process.env.HUGGINGFACE_ACCESS_TOKEN);
  try {
    const translation = await hf.translation({
      model: 'facebook/mbart-large-50-many-to-many-mmt',
      inputs: req.bodyJson.source,
      // @ts-ignore
      parameters: {
        src_lang: 'en_XX',
        tgt_lang: 'fr_XX',
      },
    });

    if (
      Array.isArray(translation) ||
      typeof translation.translation_text !== 'string'
    ) {
      return res.json({ ok: false, error: 'Failed to translate text.' }, 500);
    }

    return res.json({ ok: true, output: translation.translation_text }, 200);
  } catch (err) {
    return res.json({ ok: false, error: 'Failed to query model.' }, 500);
  }
};
