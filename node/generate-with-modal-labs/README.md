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
  "src": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
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

### MODAL_TOKEN

A unique key used to authenticate with the Modal API. This key is used to query the model for completions. You can obtain this key by signing up for an account at [Modal](https://modal.com/).

| Question      | Answer                                        |
| ------------- | --------------------------------------------- |
| Required      | Yes                                           |
| Sample Value  | `$MODAL_TOKEN_ID:$MODAL_TOKEN_SECRET`         |
| Documentation | https://modal.com/docs/reference/modal.config |
