import jwt from 'jsonwebtoken';
import sha256 from 'sha256';
import { fetch } from 'undici';
import { getStaticFile, throwIfMissing } from './utils.js';

export default async ({ req, res }) => {
  throwIfMissing(process.env, [
    'VONAGE_API_KEY',
    'VONAGE_API_SECRET',
    'VONAGE_API_SIGNATURE_SECRET',
    'VONAGE_WHATSAPP_NUMBER',
  ]);

  if (req.method === 'GET') {
    return res.text(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
  }

  const token = (req.headers.authorization ?? '').split(' ')[1];
  var decoded = jwt.verify(token, process.env.VONAGE_API_SIGNATURE_SECRET, {
    algorithms: ['HS256'],
  });

  if (sha256(req.bodyBinary) != decoded['payload_hash']) {
    return res.json({ ok: false, error: 'Payload hash mismatch.' }, 401);
  }

  try {
    throwIfMissing(req.body, ['from', 'text']);
  } catch (err) {
    return res.json({ ok: false, error: err.message }, 400);
  }

  const basicAuthToken = btoa(
    `${process.env.VONAGE_API_KEY}:${process.env.VONAGE_API_SECRET}`
  );

  await fetch(`https://messages-sandbox.nexmo.com/v1/messages`, {
    method: 'POST',
    body: JSON.stringify({
      from: process.env.VONAGE_WHATSAPP_NUMBER,
      to: req.bodyJson.from,
      message_type: 'text',
      text: `Hi there! You sent me: ${req.bodyJson.text}`,
      channel: 'whatsapp',
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${basicAuthToken}`,
    },
  });

  return res.json({ ok: true });
};
