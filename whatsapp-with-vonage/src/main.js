import jwt from 'jsonwebtoken';
import sha256 from 'sha256';
import { fetch } from 'undici';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticFolder = path.join(__dirname, '../static');

export default async ({ req, res }) => {
  const { VONAGE_API_KEY, VONAGE_API_SECRET, VONAGE_API_SIGNATURE_SECRET } =
    process.env;

  if (!VONAGE_API_KEY || !VONAGE_API_SECRET || !VONAGE_API_SIGNATURE_SECRET) {
    throw new Error('Function is missing required environment variables.');
  }

  if (req.method === 'GET') {
    const html = fs
      .readFileSync(path.join(staticFolder, 'index.html'))
      .toString();
    return res.send(html, 200, { 'Content-Type': 'text/html; charset=utf-8' });
  }

  const token = (req.headers.authorization ?? '').split(' ')[1];
  var decoded = jwt.verify(token, VONAGE_API_SIGNATURE_SECRET, {
    algorithms: ['HS256'],
  });

  if (sha256(req.bodyString) != decoded['payload_hash']) {
    throw new Error('Invalid signature.');
  }

  if (!req.body.from) {
    throw new Error('Payload invalid.');
  }

  const text = req.body.text ?? 'I only accept text messages.';

  await fetch(`https://messages-sandbox.nexmo.com/v1/messages`, {
    method: 'POST',
    body: JSON.stringify({
      from: '14157386102',
      to: req.body.from,
      message_type: 'text',
      text: `Hi there! You sent me: ${text}`,
      channel: 'whatsapp',
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa(`${VONAGE_API_KEY}:${VONAGE_API_SECRET}`)}`,
    },
  });

  return res.send('OK');
};
