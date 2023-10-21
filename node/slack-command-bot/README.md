# 🤖 Node.js Slack Command Bot Function

Simple command bot using Slack API

## 🧰 Usage

### POST /

A Endpoint for you Slack Command That Returns a Hello World! Message as Response.

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

Signing Secret of You Slack App.

| Question      | Answer                                                                             |
| ------------- | ---------------------------------------------------------------------------------- |
| Required      | Yes                                                                                |
| Sample Value  | `b33...156`                                                                        |
| Documentation | [Slack Docs](https://api.slack.com/interactivity/slash-commands#creating_commands) |
