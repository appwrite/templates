# 🤖 Node.js Generate with FAL Function

Generate images using FAL's API.

## 🧰 Usage

### GET /

HTML form for interacting with the function.

### POST /

Query the model for a completion.

**Parameters**

| Name         | Description                          | Location | Type               | Sample Value                                    |
| ------------ | ------------------------------------ | -------- | ------------------ | ----------------------------------------------- |
| Content-Type | The content type of the request body | Header   | `application/json` | N/A                                             |
| prompt       | Text to prompt the model             | Body     | String             | `city nightscape neon cyberpunk photorealistic` |

Sample `200` Response:

Response when the model successfully responds.

```json
{
  "ok": true,
  "src": "https://fal.media/files/rabbit/xqxAv3Zs0YOAXg2lzNJ54.jpeg"
}
```

Sample `400` Response:

Response when the request body is missing.

```json
{
  "ok": false,
  "error": "Missing body with a prompt."
}
```

Sample `500` Response:

Response when the model fails to respond.

```json
{
  "ok": false,
  "error": "Failed to query model."
}
```

## ⚙️ Configuration

| Setting           | Value         |
| ----------------- | ------------- |
| Runtime           | Node (18.0)   |
| Entrypoint        | `src/main.js` |
| Build Commands    | `npm install` |
| Permissions       | `any`         |
| Timeout (Seconds) | 900           |

## 🔒 Environment Variables

### FAL_API_KEY

A unique key used to authenticate with the FAL API. Please note that this is a paid service and you will be charged for each request made to the API. For more information, see the [FAL API pricing](https://fal.ai/pricing).

| Question      | Answer                                                   |
| ------------- | -------------------------------------------------------- |
| Required      | Yes                                                      |
| Sample Value  | `$FAL_KEY_ID:$FAL_KEY_SECRET`                            |
| Documentation | [FAL Docs](https://fal.ai/docs/authentication/key-based) |
