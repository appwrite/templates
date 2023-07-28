import { Octokit } from '@octokit/rest';
import { verify } from '@octokit/webhooks-methods';

class GithubService {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  /**
   * @param {*} req
   * @returns {Promise<boolean>}
   */
  async verifyWebhook(req) {
    const signature = req.headers['x-hub-signature-256'];

    return (
      typeof signature !== 'string' ||
      (await verify(
        /** @type {*} */ (process.env.GITHUB_WEBHOOK_SECRET),
        req.bodyString,
        signature
      ))
    );
  }

  /**
   * @param {any} issue
   * @param {string} comment
   */
  async postComment(issue, comment) {
    await this.octokit.issues.createComment({
      owner: issue.repository.owner.login,
      repo: issue.repository.name,
      issue_number: issue.number,
      body: comment,
    });
  }
}

export default GithubService;
