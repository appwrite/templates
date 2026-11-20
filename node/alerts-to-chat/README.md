# 💬 Node.js Alerts to Chat Function

Posts every firing and resolved monitor alert to Slack, Discord, Microsoft Teams or Google Chat.

## 🧰 Usage

### Event: `monitors.*.alerts.*.firing`, `monitors.*.alerts.*.resolved`

Receives the alert as the event payload, formats it for the chat app behind `CHAT_WEBHOOK_URL` and posts it. Usage alerts show the metric, value, threshold and peak; uptime alerts show the check and what it found. A resolved alert is a new message with how long it fired.

Calls that aren't alert events, such as an HTTP request to the function's domain, get a `403`.

**Response**

Sample `200` Response:

```json
{ "ok": true, "target": "slack" }
```

Sample `502` Response, when the chat app refuses the message:

```json
{ "ok": false, "target": "slack", "status": 404 }
```

## ⚙️ Configuration

| Setting           | Value                                                        |
| ----------------- | ------------------------------------------------------------ |
| Runtime           | Node (18.0)                                                  |
| Entrypoint        | `src/main.js`                                                |
| Build Commands    | `npm install`                                                |
| Permissions       | None                                                         |
| Events            | `monitors.*.alerts.*.firing`, `monitors.*.alerts.*.resolved` |
| Timeout (Seconds) | 15                                                           |

## 🔒 Environment Variables

### CHAT_WEBHOOK_URL

Incoming webhook URL of the channel to post to. The host picks the format:

| Host                                                       | Chat app        |
| ---------------------------------------------------------- | --------------- |
| `hooks.slack.com`                                          | Slack           |
| `discord.com/api/webhooks/…`                               | Discord         |
| `*.environment.api.powerplatform.com`, `*.logic.azure.com` | Microsoft Teams |
| `chat.googleapis.com`                                      | Google Chat     |

| Question      | Answer                                                                                                                                                                                                                                                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Required      | Yes                                                                                                                                                                                                                                                                                                                                                          |
| Sample Value  | `https://hooks.slack.com/services/T000/B000/XXXX`                                                                                                                                                                                                                                                                                                            |
| Documentation | [Slack](https://api.slack.com/messaging/webhooks), [Discord](https://support.discord.com/hc/en-us/articles/228383668), [Teams](https://support.microsoft.com/en-us/office/create-incoming-webhooks-with-workflows-for-microsoft-teams-8ae491c7-0394-4861-ba59-055e33f75498), [Google Chat](https://developers.google.com/workspace/chat/quickstart/webhooks) |

### CHAT_TARGET

The chat app to format for when the webhook URL's host doesn't say, such as a proxy: `slack`, `discord`, `teams` or `google-chat`.

| Question     | Answer  |
| ------------ | ------- |
| Required     | No      |
| Sample Value | `slack` |

## 📝 Notes

- Events are delivered at least once, so a chat app can rarely show the same alert twice.
- Microsoft Teams Office 365 connector URLs (`*.webhook.office.com`) are retired. Create the webhook with the Workflows app instead.
