import { describe, detectTarget, formatMessage } from './chat.js';

export default async ({ req, res, log, error }) => {
  // Only alert events carry a real alert. Refuse HTTP calls, which anyone
  // who can reach the function's domain could forge.
  if (req.headers['x-appwrite-trigger'] !== 'event') {
    return res.json(
      { ok: false, message: 'Only alert events trigger this function.' },
      403
    );
  }

  const alert = req.bodyJson;

  if (!alert?.monitorId || !['firing', 'resolved'].includes(alert.status)) {
    log('Ignored: not a firing or resolved alert.');
    return res.empty();
  }

  const url = process.env.CHAT_WEBHOOK_URL;
  if (!url) {
    throw new Error('Missing required variable: CHAT_WEBHOOK_URL');
  }

  const target = detectTarget(url, process.env.CHAT_TARGET);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formatMessage(target, describe(alert))),
  });

  if (!response.ok) {
    error(`${target} answered ${response.status}: ${await response.text()}`);
    return res.json({ ok: false, target, status: response.status }, 502);
  }

  log(`Posted ${alert.status} alert "${alert.name}" to ${target}.`);
  return res.json({ ok: true, target });
};
