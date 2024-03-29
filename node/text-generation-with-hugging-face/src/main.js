import { HfInference } from '@huggingface/inference';
import { getStaticFile, throwIfMissing } from './utils.js';

export default async ({ req, res }) => {
  throwIfMissing(process.env, ['HUGGINGFACE_ACCESS_TOKEN']);

  if (req.method === 'GET') {
    return res.send(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
  }

  if (!req.body.prompt) {
    return res.json({ ok: false, error: 'Prompt is required.' }, 400);
  }

  const hf = new HfInference(process.env.HUGGINGFACE_ACCESS_TOKEN);

  try {
    const completion = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: req.body.prompt,
      max_new_tokens: req.body.max_new_tokens || 200,
    });

    return res.json({ ok: true, completion }, 200);
  } catch (err) {
    return res.json({ ok: false, error: 'Failed to query model.' }, 500);
  }
};
