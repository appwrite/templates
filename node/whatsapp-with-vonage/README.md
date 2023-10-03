# 💬 Node.js WhatsApp Bot with Vonage Function

Simple bot to answer WhatsApp messages.

## 🧰 Usage

### GET /

HTML form for interacting with the function.

### POST /

Receives a message, validates its signature, and sends a response back to the sender.

**Parameters**

| Name          | Description                        | Location | Type                | Sample Value         |
| ------------- | ---------------------------------- | -------- | ------------------- | -------------------- |
| Content-Type  | Content type of the request        | Header   | `application/json ` | N/A                  |
| Authorization | Webhook signature for verification | Header   | String              | `Bearer <signature>` |
| from          | Sender's identifier.               | Body     | String              | `12345`              |
| text          | Text content of the message.       | Body     | String              | `Hello!`             |

> All parameters are coming from Vonage webhook. Exact documentation can be found in [Vonage API Docs](https://developer.vonage.com/en/api/messages-olympus#inbound-message).

**Response**

Sample `200` Response:

```json
{
  "ok": true
}
```

Sample `400` Response:

```json
{
  "ok": false,
  "error": "Missing required parameter: from"
}
```

Sample `401` Response:

```json
{
  "ok": false,
  "error": "Payload hash mismatch."
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

### VONAGE_API_KEY

API Key to use the Vonage API.

| Question      | Answer                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Required      | Yes                                                                                                                      |
| Sample Value  | `62...97`                                                                                                                |
| Documentation | [Vonage: Q&A](https://api.support.vonage.com/hc/en-us/articles/204014493-How-do-I-find-my-Voice-API-key-and-API-secret-) |

### VONAGE_API_SECRET

Secret to use the Vonage API.

| Question      | Answer                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Required      | Yes                                                                                                                      |
| Sample Value  | `Zjc...5PH`                                                                                                              |
| Documentation | [Vonage: Q&A](https://api.support.vonage.com/hc/en-us/articles/204014493-How-do-I-find-my-Voice-API-key-and-API-secret-) |

### VONAGE_API_SIGNATURE_SECRET

Secret to verify the webhooks sent by Vonage.

| Question      | Answer                                                                                                         |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                            |
| Sample Value  | `NXOi3...IBHDa`                                                                                                |
| Documentation | [Vonage: Webhooks](https://developer.vonage.com/en/getting-started/concepts/webhooks#decoding-signed-webhooks) |

### VONAGE_WHATSAPP_NUMBER

Vonage WhatsApp number to send messages from.

| Question      | Answer                                                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                                           |
| Sample Value  | `+14000000102`                                                                                                                |
| Documentation | [Vonage: Q&A](https://api.support.vonage.com/hc/en-us/articles/4431993282580-Where-do-I-find-my-WhatsApp-Number-Certificate-) |
