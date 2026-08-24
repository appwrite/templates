import { throwIfMissing } from './utils.js';

const ENDPOINT = 'https://api.keplars.com/api/v1/send-email/async';

export default async ({ req, res, log, error }) => {
  throwIfMissing(process.env, ['KEPLARS_API_KEY']);

  if (req.method !== 'POST') {
    return res.json({ ok: false, error: 'Method not allowed' }, 405);
  }

  const { to, from, from_name, subject, body, template_id, params } =
    req.body ?? {};

  if (!to || !from || !subject) {
    return res.json(
      { ok: false, error: 'Missing required fields: to, from, subject' },
      400
    );
  }

  if (!body && !template_id) {
    return res.json(
      {
        ok: false,
        error: 'Either body or template_id must be provided',
      },
      400
    );
  }

  const payload = {
    to: Array.isArray(to) ? to : [to],
    from,
    subject,
  };

  if (from_name) payload.from_name = from_name;
  if (body) payload.body = body;
  if (template_id) payload.template_id = template_id;
  if (params && typeof params === 'object') payload.params = params;

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.KEPLARS_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'keplars-appwrite/1.0.0',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const message =
        typeof data?.message === 'string'
          ? data.message
          : `Keplars API error: ${response.status}`;
      error(message);
      return res.json({ ok: false, error: message }, response.status);
    }

    log(`Email sent to ${Array.isArray(to) ? to.join(', ') : to}`);
    return res.json({ ok: true, data });
  } catch (err) {
    error(err.message);
    return res.json({ ok: false, error: 'Failed to send email' }, 500);
  }
};
