import { OpenAIApi, Configuration } from 'openai';
import { getStaticFile, throwIfMissing } from './utils';

export default async ({ req, res, error }) => {
  throwIfMissing(process.env, ['OPENAI_API_KEY', 'OPENAI_MAX_TOKENS']);

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  if (req.method === 'GET') {
    return res.send(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
  }

  try {
    throwIfMissing(req.body, ['prompt']);
  } catch (err) {
    return res.json({ ok: false, error: err.message }, 400);
  }

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS ?? '512'),
    messages: [{ role: 'user', content: req.body.prompt }],
  });

  const completion = response.data.choices[0].message;
  if (!completion) {
    return res.json({ ok: false, error: 'Failed to query model.' }, 500);
  }

  return res.json({ ok: true, completion }, 200);
};
