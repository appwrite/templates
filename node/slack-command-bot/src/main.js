import { throwIfMissing } from './utils.js';
import crypto from 'crypto';

const verifyRequestSignature = (timestamp, bodyRaw, signature) => {
  const sig_basestring = 'v0:' + timestamp + ':' + bodyRaw;
  const hmac = crypto.createHmac('sha256', process.env['SLACK_SIGNING_SECRET']);
  hmac.update(sig_basestring);
  const mySignature = 'v0=' + hmac.digest('hex');
  return mySignature === signature;
};

export default async ({ req, res, log, error }) => {
  // Throw Error if environment variables are not set
  throwIfMissing(process.env, ['SLACK_SIGNING_SECRET']);

  // Verify If Headers and Body have the required data
  if (
    !req.bodyRaw ||
    !req.headers['x-slack-request-timestamp'] ||
    !req.headers['x-slack-signature']
  ) {
    error('Inavlid Request : Headers and Body Not Present');
    return res.json(
      { error: 'Inavlid Request : Headers and Body Not Present' },
      401
    );
  }

  // Verify That request is not Replay Attact
  const timestamp = req.headers['x-slack-request-timestamp'];
  if (Math.abs(Date.now() / 1000 - timestamp) > 60 * 5) {
    error('Replay Attack');
    return res.json({ error: 'Replay Attack' }, 401);
  }

  // Verify Request Signature
  if (
    !verifyRequestSignature(
      timestamp,
      req.bodyRaw,
      req.headers['x-slack-signature']
    )
  ) {
    error('Invalid Request : Signature Not Matched');
    return res.json({ error: 'Invalid Request : Signature Not Matched' }, 401);
  }

  log('Valid Request');
  if (req.method === 'POST') {
    return res.send('Hello World!');
  } else {
    return res.json({
      motto: 'Build Fast. Scale Big. All in One Place.',
      learn: 'https://appwrite.io/docs',
      connect: 'https://appwrite.io/discord',
      getInspired: 'https://builtwith.appwrite.io',
    });
  }
};
