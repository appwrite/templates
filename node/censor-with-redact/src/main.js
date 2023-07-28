import { fetch } from 'undici';
import { getStaticFile, throwIfMissing } from './utils.js';

export default async ({ req, res }) => {
  throwIfMissing(process.env, ['PANGEA_REDACT_TOKEN']);

  if (req.method === 'GET') {
    return res.send(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
  }

  try {
    throwIfMissing(req.body, ['text']);
  } catch (err) {
    return res.json({ ok: false, error: err.message }, 400);
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
