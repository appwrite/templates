# 🤖 Node.js GitHub Issue Bot Function

Automate the process of responding to newly opened issues on a GitHub repository.

## 🧰 Usage

### POST /

Handles webhook and returns a verification response.

**Parameters**

| Name                | Description               | Location | Type   | Sample Value                                                                                          |
| ------------------- | ------------------------- | -------- | ------ | ----------------------------------------------------------------------------------------------------- |
| x-hub-signature-256 | GitHub webhook signature  | Header   | String | `h74ba0jbla01lagudfo`                                                                                 |
| x-github-event      | GitHub webhook event type | Header   | String | `issues`                                                                                              |
| JSON Body           | GitHub webhook payload    | Body     | Object | See [GitHub docs](https://docs.github.com/en/webhooks-and-events/webhooks/webhook-events-and-payload) |

**Response**

Sample `200` Response:

Webhook verification successful.

```json
{ "ok": true }
```

Sample `401` Response:

Webhook verification failed.

```json
{ "ok": false, "error": "Invalid signature" }
```

## ⚙️ Configuration

| Setting           | Value         |
| ----------------- | ------------- |
| Runtime           | Node (18.0)   |
| Entrypoint        | `src/main.js` |
| Build Commands    | `npm install` |
| Permissions       | `any`         |
| Timeout (Seconds) | 15            |

## 🔒 Environment Variables

### GITHUB_WEBHOOK_SECRET

The secret used to verify that the webhook request comes from GitHub.

| Question      | Answer                                                                                          |
| ------------- | ----------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                             |
| Sample Value  | `d1efb...aec35`                                                                                 |
| Documentation | [GitHub Docs](https://docs.github.com/en/developers/webhooks-and-events/securing-your-webhooks) |

### GITHUB_TOKEN

A personal access token from GitHub with the necessary permissions to post comments on issues.

| Question      | Answer                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                        |
| Sample Value  | `ghp_1...`                                                                                                 |
| Documentation | [GitHub Docs](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) |
