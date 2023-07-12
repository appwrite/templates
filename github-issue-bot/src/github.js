import { Octokit } from '@octokit/rest'
import getEnvironment from './environment'

export default function GithubService() {
  const { GITHUB_TOKEN } = getEnvironment()

  const octokit = new Octokit({
    auth: GITHUB_TOKEN,
  })

  return {
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
      })
    },
  }
}
