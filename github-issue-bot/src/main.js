import EnvironmentService from './environment.js';
import GithubService from './github.js';

export default async ({ res, req, log, error }) => {
  const environment = EnvironmentService();
  const github = GithubService(environment);

  const { DISCORD_LINK } = environment;

  if (!(await github.verifyWebhook(req))) {
    error('Invalid signature');
    return res.json({ error: 'Invalid signature' }, 401);
  }

  if (req.headers['x-github-event'] === 'issues') {
    const { issue } = req.body;
    if (!issue || req.body.action !== 'opened') {
      log('No issue provided or not opened event');
      return res.json({ success: true });
    }

    await github.postComment(
      issue,
      `Thanks for the issue report @${issue.user.login}! I'm inviting you to join our Discord for quicker support: ${DISCORD_LINK}`
    );
  }

  return res.json({ success: true });
};
