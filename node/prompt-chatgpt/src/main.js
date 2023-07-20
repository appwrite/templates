import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenAIApi, Configuration } from 'openai';
import EnvironmentService from './environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticFolder = path.join(__dirname, '../static');

export default async ({ req, res }) => {
  const env = new EnvironmentService();

  const configuration = new Configuration({
    apiKey: env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  if (req.method === 'GET') {
    let html = fs
      .readFileSync(path.join(staticFolder, 'index.html'))
      .toString();
    return res.send(html, 200, { 'Content-Type': 'text/html; charset=utf-8' });
  }

  if (!req.bodyString) {
    return res.send('Missing body with a prompt.', 400);
  }

  const chatCompletion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    max_tokens: env.OPENAI_MAX_TOKENS,
    messages: [{ role: 'user', content: req.bodyString }],
  });

  return res.send(chatCompletion.data.choices[0].message, 200);
};
