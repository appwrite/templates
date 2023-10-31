## 💬 Bun Whatsapp bot with Vonage Function
Simple bot to answer WhatsApp messages.


## 🧰 Usage
## GET/
HTML form interacting with the function.
## POST/
Receives a message, validates its signature, and sends a response back to the sender.

| Name          | Description                        | Location | Type                | Sample Value         |
| ------------- | ---------------------------------- | -------- | ------------------- | -------------------- |
| Content-Type  | Content type of the request        | Header   | `application/json ` | N/A                  |
| Authorization | Webhook signature for verification | Header   | String              | `Bearer <signature>` |
| from          | Sender's identifier.               | Body     | String              | `user`              |
| text          | Text content of the message.       | Body     | String              | `Hello World`             |

**Response:**


Sample `200` Response:

```json
{
    "ok": true,
    
}
```

Sample `400` Response:

```json
{
    "ok": false,
    "error": "can't verify"
}
```

## POST/

Webhooks sent by vonage to update about the status of message

| Name          | Description                        | Location | Type                | Sample Value         |
| ------------- | ---------------------------------- | -------- | ------------------- | -------------------- |
| Status  | showing the status of message    | body  | string| submitted/read/delievered          |



**Response:**


```json
{
    "ok": 200,
    "status":"delievered/submitted/read"
}
```



## VONAGE_API_KEY

API Key to use the Vonage API.

| Question      | Answer                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Required      | Yes                                                                                                                      |
| Sample Value  | `P2...97`                                                                                                                |

## VONAGE_WHATSAPP_NUMBER

Vonage WhatsApp number to send messages from.

| Question      | Answer                                                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                                           |
| Sample Value  | `1234567890`                                                                                                                 



## VONAGE_ACCOUNT_SECRET

ACCOUNT_SECRET to use the Vonage API.

| Question      | Answer                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Required      | Yes                                                                                                                      |
| Sample Value  | `p524...97`                                                                                                                |

## VONAGE_SIGNATURE_SECRET

Secret to verify the webhooks sent by Vonage.

| Question      | Answer                                                                                                         |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                            |
| Sample Value  | `ZACYi3...ZXGjsch`                                                                                                |

## CONFIGURATION


| Setting           | Value                    |
| ----------------- | ------------------------ |
| Runtime           | Bun (1.0)              |
| Entrypoint        | `src/main.js`            |
| Build Commands    | `Bun install src/main.js` |
| Permissions       | `any`                    |
| Timeout (Seconds) | 15                       |


## ENVIRONMENT VARIABLES

Following environment variables are required :

`VONAGE_API_KEY`

`VONAGE_ACCOUNT_SECRET`

`VONAGE_SIGNATURE_SECRET`

`VONAGE_WHATSAPP_NUMBER`

## Documentation

[Vonage Documentation ](https://developer.vonage.com/en/documentation)

