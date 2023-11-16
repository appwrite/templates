## 💬 Bun Whatsapp bot with Vonage Function

Simple bot to answer WhatsApp messages.

## 🧰 Usage

## GET /

HTML form interacting with the function.

## POST /

Receives a message, validates its signature, and sends a response back to the sender.

| Name          | Description                        | Location | Type                | Sample Value         |
| ------------- | ---------------------------------- | -------- | ------------------- | -------------------- |
| Content-Type  | Content type of the request        | Header   | `application/json ` | N/A                  |
| Authorization | Webhook signature for verification | Header   | String              | `Bearer <signature>` |
| from          | Sender's identifier.               | Body     | String              | `user`               |
| text          | Text content of the message.       | Body     | String              | `Hello World`        |

**Response:**

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

## VONAGE_API_KEY

API Key to use the Vonage API.

| Question     | Answer    |
| ------------ | --------- |
| Required     | Yes       |
| Sample Value | `P2...97` |

## VONAGE_WHATSAPP_NUMBER

Vonage WhatsApp number to send messages from.

| Question     | Answer       |
| ------------ | ------------ |
| Required     | Yes          |
| Sample Value | `1234567890` |

## VONAGE_ACCOUNT_SECRET

ACCOUNT_SECRET to use the Vonage API.

| Question     | Answer      |
| ------------ | ----------- |
| Required     | Yes         |
| Sample Value | `p524...97` |

## VONAGE_SIGNATURE_SECRET

Secret to verify the webhooks sent by Vonage.

| Question     | Answer             |
| ------------ | ------------------ |
| Required     | Yes                |
| Sample Value | `ZACYi3...ZXGjsch` |

## CONFIGURATION

| Setting           | Value          |
| ----------------- | -------------- |
| Runtime           | Bun (1.0)      |
| Entrypoint        | `src/main.ts`  |
| Build Commands    | `bun install ` |
| Permissions       | `any`          |
| Timeout (Seconds) | 15             |
