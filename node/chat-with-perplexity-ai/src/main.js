import OpenAI from 'openai';
import { getStaticFile, throwIfMissing } from './utils.js';

export default async ({ req, res, error }) => {
  throwIfMissing(process.env, ['PERPLEXITY_API_KEY']);

  if (req.method === 'GET') {
    return res.send(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
  }

  const model = process.env['PERPLEXITY_MODEL'] || 'mistral-7b-instruct';


  if (!req.body.prompt || typeof req.body.prompt !== 'string') {
    return res.send({ ok: false, error: 'Missing required field `prompt`' }, 400)
  }

  const perplexity = new OpenAI({
    apiKey: process.env.PERPLEXITY_API_KEY,
    baseURL: 'https://api.perplexity.ai',
  });

  try {
    const response = await perplexity.chat.completions.create({
      model: model,
      max_tokens: parseInt(process.env.PERPLEXITY_MAX_TOKENS ?? '512'),
      messages: [{ role: 'user', content: req.body.prompt }],
      stream: false,
    });
    const completion = response.choices[0].message?.content;
    return res.json({ ok: true, completion }, 200);
  } catch (err) {
    error(err);
    return res.json({ ok: false, error: 'Failed to query model.' }, 500);
  }
};
