import { Octokit } from '@octokit/rest';
import { verify } from '@octokit/webhooks-methods';

type Repository = {
  owner: { login: string };
  name: string;
};

type Issue = {
  number: number;
};

class GithubService {
  private octokit: Octokit;
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  async verifyWebhook(req: any): Promise<boolean> {
    const signature = req.headers['x-hub-signature-256'];

    return (
      typeof signature !== 'string' ||
      (await verify(process.env.GITHUB_WEBHOOK_SECRET, req.bodyRaw, signature))
    );
  }

  isIssueOpenedEvent(req: any): boolean {
    return (
      req.headers['x-github-event'] === 'issues' &&
      req.body.issue &&
      req.body.action === 'opened'
    );
  }

  async postComment(
    repository: Repository,
    issue: Issue,
    comment: string
  ): Promise<void> {
    await this.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: comment,
    });
  }
}

export default GithubService;
