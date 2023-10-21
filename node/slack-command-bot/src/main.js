import { throwIfMissing,throwIfRequestNotVerified,throwIfReplayAttack } from './utils.js';

export default async ({ req, res, log, error }) => {
  throwIfMissing(process.env, ['SLACK_SIGNING_SECRET']);

  throwIfMissing(req.headers,["x-slack-request-timestamp",'x-slack-signature'])

  const timestamp = req.headers['x-slack-request-timestamp'];
  throwIfReplayAttack(timestamp)
  throwIfRequestNotVerified(
    timestamp,
    req.bodyRaw,
    req.headers['x-slack-signature']
  )

  log('Valid Request');
  // The Response Body Will Be The Text message in Slack You Can Send JSON Objects using res.json to display JSON Objects
  return res.send('Hello World!');
};
