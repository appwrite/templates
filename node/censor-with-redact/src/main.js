import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetch } from 'undici';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticFolder = path.join(__dirname, '../static');

export default async ({ req, res }) => {
  if (!process.env.PANGEA_REDACT_TOKEN) {
    throw new Error('Missing required environment variables.');
  }

  if (req.method === 'GET') {
    const html = fs
      .readFileSync(path.join(staticFolder, 'index.html'))
      .toString();
    return res.send(html, 200, { 'Content-Type': 'text/html; charset=utf-8' });
  }

  if (!req.body.text) {
    return res.json({ ok: false, error: 'Missing require field: text.' }, 400);
  }

  const response = await fetch(`https://redact.aws.eu.pangea.cloud/v1/redact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.PANGEA_REDACT_TOKEN}`,
    },
    body: JSON.stringify({
      text: req.body.text,
    }),
  });

  const data = /** @type {*} */ (await response.json());
  return res.json({ ok: true, redacted: data.result.redacted_text });
};
