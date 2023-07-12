import getEnvironment from './environment'
import { verify } from '@octokit/webhooks-methods'
import GithubService from './github'

export default async ({ res, req, log, error }) => {
  const { GITHUB_WEBHOOK_SECRET, DISCORD_LINK } = getEnvironment()
  const github = GithubService()

  const signature = req.headers['x-hub-signature-256']
  if (
    typeof signature !== 'string' ||
    (await verify(GITHUB_WEBHOOK_SECRET, req.bodyString, signature))
  ) {
    error('Invalid signature')
    return res.json({ error: 'Invalid signature' }, 401)
  }

  if (req.headers['x-github-event'] === 'issues') {
    const { issue } = req.body
    if (!issue || req.body.action !== 'opened') {
      log('No issue provided or not opened event')
      return res.json({ success: true })
    }

    await github.postComment(
      issue,
      `Thanks for the issue report @${issue.user.login}! I'm inviting you to join our Discord for quicker support: ${DISCORD_LINK}`
    )
  }

  return res.json({ success: true })
}
