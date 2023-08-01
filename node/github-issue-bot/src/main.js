import GithubService from './github.js';
import { throwIfMissing } from './utils.js';

export default async ({ res, req, log, error }) => {
  throwIfMissing(process.env, ['GITHUB_WEBHOOK_SECRET', 'GITHUB_TOKEN']);

  const github = new GithubService();

  if (!(await github.verifyWebhook(req))) {
    error('Invalid signature');
    return res.json({ error: 'Invalid signature' }, 401);
  }

  if (!github.isIssueOpenedEvent(req)) {
    return res.json({ success: true });
  }

  await github.postComment(
    req.body.issue,
    `Thanks for the issue report @${req.body.issue.user.login}! We will look into it ASAP.`
  );
};
