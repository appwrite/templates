# ⚡ Vonage Message Receiver and Responder

Automatically respond to messages sent to a Vonage WhatsApp number.

## 🧰 Usage

### `GET`

Serves a HTML page.

### `POST`

Receives a message, validates its signature, and sends a response back to the sender.

**Parameters**

| Name          | Description                         | Location | Type                | Sample Value     |
| ------------- | ----------------------------------- | -------- | ------------------- | ---------------- |
| Content-Type  | Content type of the request         | Header   | `application/json ` | N/A              |
| Authorization | Authorization token for the request | Header   | String              | `Bearer <token>` |
| from          | Sender's identifier.                | Body     | String              | `12345`          |
| text          | Text content of the message.        | Body     | String              | `Hello!`         |


To generate the Bearer token, you can use the following snippet:

````js
import jwt from 'jsonwebtoken';

const token = jwt.sign(
    { payload_hash: sha256(JSON.stringify(payload)) },
    process.env.VONAGE_API_SIGNATURE_SECRET
);
```

**Response**

Sample `200` Response:

```json
{
  "ok": true
}
````

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

| Question     | Answer     |
| ------------ | ---------- |
| Required     | Yes        |
| Sample Value | `abcd1234` |

### VONAGE_API_SECRET

Secret to use the Vonage API.

| Question     | Answer     |
| ------------ | ---------- |
| Required     | Yes        |
| Sample Value | `efgh5678` |

### VONAGE_API_SIGNATURE_SECRET

Secret to verify the JWT token sent by Vonage.

| Question     | Answer      |
| ------------ | ----------- |
| Required     | Yes         |
| Sample Value | `ijkl91011` |

### VONAGE_WHATSAPP_NUMBER

Vonage WhatsApp number to send messages from.

| Question     | Answer      |
| ------------ | ----------- |
| Required     | Yes         |
| Sample Value | `123456789` |

