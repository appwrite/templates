import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenAIApi, Configuration } from 'openai';
import { throwIfMissing } from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticFolder = path.join(__dirname, '../static');

export default async ({ req, res, error }) => {
  throwIfMissing(process.env, ['OPENAI_API_KEY', 'OPENAI_MAX_TOKENS']);

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  if (req.method === 'GET') {
    let html = fs
      .readFileSync(path.join(staticFolder, 'index.html'))
      .toString();
    return res.send(html, 200, { 'Content-Type': 'text/html; charset=utf-8' });
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
