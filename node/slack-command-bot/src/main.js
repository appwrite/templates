import { throwIfMissing, throwIfRequestNotValid } from './utils.js';

export default async ({ req, res, log, error }) => {
  throwIfMissing(process.env, ['SLACK_SIGNING_SECRET']);
  throwIfMissing(req.headers, [
    'x-slack-request-timestamp',
    'x-slack-signature',
  ]);
  throwIfRequestNotValid(req);

  log('Valid Request');
  return res.send('Hello World!');
};
