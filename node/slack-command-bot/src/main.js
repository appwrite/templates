import { throwIfMissing, throwIfRequestNotValid } from './utils.js';

export default async ({ req, res, log, error }) => {
  throwIfMissing(process.env, ['SLACK_SIGNING_SECRET']);

  try {
    throwIfMissing(req.headers, [
      'x-slack-request-timestamp',
      'x-slack-signature',
    ]);
    throwIfRequestNotValid(req);
  } catch (err) {
    error(err.message);
    return res.json({ ok: false, error: err.message }, 400);
  }

  log('Valid Request');
  return res.text('Hello World!');
};
