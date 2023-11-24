# 🤖 Node.js Slack Command Bot Function

Simple command bot using Slack API

## 🧰 Usage

### POST /

A endpoint for you slack command that returns a hello world! message as response.

#### Parameters

| Name                      | Description                      | Location | Type   | Sample Value                                                                              |
| ------------------------- | -------------------------------- | -------- | ------ | ----------------------------------------------------------------------------------------- |
| x-slack-signature         | Signature of the request payload | Header   | string | `v0=a...3`                                                                                |
| x-slack-request-timestamp | Timestamp of the request payload | Header   | string | `1531420618`                                                                              |
| JSON Body                 | Request payload                  | Body     | Object | See [Slack docs](https://api.slack.com/interactivity/slash-commands#app_command_handling) |

**Response**

Sample `200` Response:

```text
Hello, World!
```

Sample `400` Response:

```json
{
  "ok": false,
  "error": "Missing required fields: x-slack-signature"
}
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

### SLACK_SIGNING_SECRET

Signing secret of you slack app.

| Question      | Answer                                                                             |
| ------------- | ---------------------------------------------------------------------------------- |
| Required      | Yes                                                                                |
| Sample Value  | `b33...156`                                                                        |
| Documentation | [Slack Docs](https://api.slack.com/interactivity/slash-commands#creating_commands) |
