import { HfInference } from '@huggingface/inference';
import { getStaticFile, throwIfMissing } from './utils.js';

export default async ({ req, res }) => {
  throwIfMissing(process.env, ['HUGGINGFACE_ACCESS_TOKEN']);

  if (req.method === 'GET') {
    return res.send(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
  }

  if (!req.body.sourceText && typeof req.body.sourceText !== 'string') {
    return res.json({ ok: false, error: 'sourceText is required.' }, 400);
  }

  const hf = new HfInference(process.env.HUGGINGFACE_ACCESS_TOKEN);
  try {
    const response = await hf.translation({
      model: 'facebook/mbart-large-50-many-to-many-mmt',
      inputs: req.body.sourceText,
      // @ts-ignore
      parameters: {
        src_lang: 'en_XX',
        tgt_lang: 'fr_XX',
      },
    });

    if (
      Array.isArray(response) ||
      typeof response.translation_text !== 'string'
    ) {
      return res.json({ ok: false, error: 'Failed to translate text.' }, 500);
    }

    return res.json({ ok: true, outputText: response.translation_text }, 200);
  } catch (err) {
    return res.json({ ok: false, error: 'Failed to query model.' }, 500);
  }
};
