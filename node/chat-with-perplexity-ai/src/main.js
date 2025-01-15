import OpenAI from 'openai';
import { getStaticFile, throwIfMissing } from './utils.js';

export default async ({ req, res, error }) => {
  throwIfMissing(process.env, ['PERPLEXITY_API_KEY']);

  if (req.method === 'GET') {
    return res.text(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
  }

  if (req.method !== 'POST') {
    return res.json({ ok: false, error: 'Method not allowed' }, 405);
  }

  if (!req.bodyJson.prompt || typeof req.bodyJson.prompt !== 'string') {
    return res.json(
      { ok: false, error: 'Missing required field `prompt`' },
      400
    );
  }

  const perplexity = new OpenAI({
    apiKey: process.env.PERPLEXITY_API_KEY,
    baseURL: 'https://api.perplexity.ai',
  });

  try {
    const response = await perplexity.chat.completions.create({
      model: 'llama-3.1-sonar-small-128k-online',
      max_tokens: parseInt(process.env.PERPLEXITY_MAX_TOKENS ?? '512'),
      messages: [{ role: 'user', content: req.bodyJson.prompt }],
      stream: false,
    });
    const completion = response.choices[0].message?.content;
    return res.json({ ok: true, completion }, 200);
  } catch (err) {
    error(err);
    return res.json({ ok: false, error: 'Failed to query model.' }, 500);
  }
};
