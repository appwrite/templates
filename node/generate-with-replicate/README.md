# 🤖 Generate with Replicate

Generate text, audio and images using Replicate's API.

## 🧰 Usage

### GET /

HTML form for interacting with the function.

### POST /

Query the model for a completion.

**Parameters**

| Name         | Description                                                           | Location | Type               | Sample Value                  |
| ------------ | --------------------------------------------------------------------- | -------- | ------------------ | ----------------------------- |
| Content-Type | The content type of the request body                                  | Header   | `application/json` | N/A                           |
| prompt       | Text to prompt the model                                              | Body     | String             | `Write a haiku about Mondays` |
| type         | The type of completion to generate, can be `text`, `audio` or `image` | Body     | String             | `text`                        |

Sample `200` Response:

Response from the model.

```json
{
  "ok": true,
  "completion": "Monday's heavy weight, Dawning with a sigh of grey, Hopeful hearts await.",
  "type": "text"
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

### REPLICATE_API_KEY

A unique key used to authenticate with the Replicate API. Please note that this is a paid service and you will be charged for each request made to the API. For more information, see the [Replicate AI pricing page](https://replicate.com/pricing).

| Question      | Answer                                                          |
| ------------- | --------------------------------------------------------------- |
| Required      | Yes                                                             |
| Sample Value  | `r8_......`                                                     |
| Documentation | [Replicate Docs](https://replicate.com/docs/get-started/nodejs) |
