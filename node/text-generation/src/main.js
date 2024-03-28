import { HfInference } from '@huggingface/inference';
import { getStaticFile, throwIfMissing } from './utils.js';

export default async ({ req, res }) => {
  throwIfMissing(process.env, ['OPENAI_API_KEY']);

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
      model: 'meta-llama/Llama-2-7b-chat-hf',
      inputs: req.body.prompt,
    });

    return res.json({ ok: true, completion }, 200);
  } catch (err) {
    return res.json({ ok: false, error: 'Failed to query model.' }, 500);
  }
};
