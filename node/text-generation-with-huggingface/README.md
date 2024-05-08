# 🤖 Text generation with hugging face Function

Ask question, and use Huggingface inference models to get the answer.

## 🧰 Usage

### GET /

HTML form for interacting with the function.

### POST /

Query the model for a completion.

**Parameters**

| Name         | Description                          | Location | Type               | Sample Value                  |
| ------------ | ------------------------------------ | -------- | ------------------ | ----------------------------- |
| Content-Type | The content type of the request body | Header   | `application/json` | N/A                           |
| prompt       | Text to prompt the model             | Body     | String             | `Write a haiku about Mondays` |

Sample `200` Response:

Response from the model.

```json
{
  "ok": true,
  "completion": "Monday's heavy weight, Dawning with a sigh of grey, Hopeful hearts await."
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
| Timeout (Seconds) | 15            |

## 🔒 Environment Variables

### HUGGINGFACE_ACCESS_TOKEN

An access token for the HuggingFace API. Get one by signing up at [HuggingFace](https://huggingface.co/).

| Question      | Answer                                                                          |
| ------------- | ------------------------------------------------------------------------------- |
| Required      | Yes                                                                             |
| Sample Value  | `api_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`                                  |
| Documentation | [HuggingFace API Documentation](https://huggingface.co/docs/datasets/translate) |
