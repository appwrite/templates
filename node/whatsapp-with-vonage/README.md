# ⚡ Vonage Message Receiver and Responder

Automatically respond to messages sent to a Vonage WhatsApp number.

## 🧰 Usage

### `GET /`

Serves a HTML page.

### `POST /`

Receives a message, validates its signature, and sends a response back to the sender.

**Parameters**

| Name         | Description                  | Location | Type                | Sample Value |
| ------------ | ---------------------------- | -------- | ------------------- | ------------ |
| Content-Type | Content type of the request  | Header   | `application/json ` | N/A          |
| from         | Sender's identifier.         | Body     | String              | `12345`      |
| text         | Text content of the message. | Body     | String              | `Hello!`     |

**Response**

Sample `200` Response:

```text
OK
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
