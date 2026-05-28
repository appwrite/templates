import { throwIfMissing } from './utils.js';

const PRIORITY_ENDPOINTS = {
  instant: 'https://api.keplars.com/api/v1/send-email/instant',
  high: 'https://api.keplars.com/api/v1/send-email/high',
  async: 'https://api.keplars.com/api/v1/send-email/async',
  bulk: 'https://api.keplars.com/api/v1/send-email/bulk',
};

export default async ({ req, res, log, error }) => {
  throwIfMissing(process.env, ['KEPLARS_API_KEY']);

  if (req.method !== 'POST') {
    return res.json({ ok: false, error: 'Method not allowed' }, 405);
  }

  const {
    to,
    from,
    from_name,
    subject,
    body,
    template_id,
    params,
  } = req.body ?? {};

  if (!to || !from || !subject) {
    return res.json(
      { ok: false, error: 'Missing required fields: to, from, subject' },
      400
    );
  }

  const priority = process.env.KEPLARS_PRIORITY ?? 'high';
  const endpoint = PRIORITY_ENDPOINTS[priority] ?? PRIORITY_ENDPOINTS.high;

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
    const response = await fetch(endpoint, {
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
      error(`Keplars API error ${response.status}: ${JSON.stringify(data)}`);
      return res.json({ ok: false, error: data }, response.status);
    }

    log(`Email sent to ${Array.isArray(to) ? to.join(', ') : to}`);
    return res.json({ ok: true, data });
  } catch (err) {
    error(err.message);
    return res.json({ ok: false, error: 'Failed to send email' }, 500);
  }
};
