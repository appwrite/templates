import { Octokit } from '@octokit/rest';
import { verify } from '@octokit/webhooks-methods';

export default function GithubService(environment) {
  const { GITHUB_TOKEN, GITHUB_WEBHOOK_SECRET } = environment;

  const octokit = new Octokit({
    auth: GITHUB_TOKEN,
  });

  return {
    /**
     *
     * @param {*} req
     * @returns {Promise<boolean>}
     */
    verifyWebhook: async function (req) {
      const signature = req.headers['x-hub-signature-256'];

      return (
        typeof signature !== 'string' ||
        (await verify(GITHUB_WEBHOOK_SECRET, req.bodyString, signature))
      );
    },
    /**
     * @param {any} issue
     * @param {string} comment
     */
    postComment: async function (issue, comment) {
      await octokit.issues.createComment({
        owner: issue.repository.owner.login,
        repo: issue.repository.name,
        issue_number: issue.number,
        body: comment,
      });
    },
  };
}
