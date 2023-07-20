# GitHub Issue Bot

This function allows you to automate the process of responding to newly opened issues on a GitHub repository. The bot verifies the webhook request, checks if it's a new issue event and then posts a comment on the issue, inviting the user to join your Discord for quicker support.

## Environment Variables

To ensure the function operates as intended, ensure the following variables are set:

- **GITHUB_WEBHOOK_SECRET**: The webhook secret from your GitHub repository settings.
- **GITHUB_TOKEN**: A personal access token from GitHub with the necessary permissions to post comments on issues.
- **DISCORD_LINK**: The link to your Discord community where users can get support.

## GitHub Bot Setup

Before you can use this function, you need to set up a webhook for your GitHub repository. You can do this in the settings page of your repository. Here, you can click the 'Webhooks' option and then the 'Add webhook' button. 

## GitHub Webhooks

This function utilizes the GitHub Webhooks service. Webhooks allow you to build or set up integrations which subscribe to certain events on GitHub. When one of those events is triggered, GitHub sends a HTTP POST payload to the webhook's configured URL. We specifically use the 'issues' event to track new issues on the repository.

## Usage

This function supports the interaction of new issue events coming from GitHub:

1. **Posting a comment on newly opened issues**

   - **Webhook Event Type:** 'issues'
   - **Issue Action:** 'opened'
   - **Response:** 
     - On successfully posting a comment, the function will end with an HTTP 204 No Content response.
     - If there's an error while posting the comment, the function will respond with an HTTP 500 status and the error message.

## Error Handling

In case of any error during the webhook request verification or interaction handling, the function will return an HTTP 401 error with the message "Invalid signature" or an HTTP 500 error with the message "Error posting comment", respectively. In case any of the required environment variables is not set, the function will throw an error specifying which environment variable is missing.