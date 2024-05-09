# 🤖 Node Languague Translation with Hugging Face Function

Translate text using the Hugging Face API. Enter English text and get the French translation.

## 🧰 Usage

### GET /

HTML form for interacting with the function.

### POST /

Query the model for a translation.

**Parameters**

| Name         | Description                          | Location | Type               | Sample Value        |
| ------------ | ------------------------------------ | -------- | ------------------ | ------------------- |
| Content-Type | The content type of the request body | Header   | `application/json` | N/A                 |
| source       | Text to translate                    | Body     | String             | `My name is Walter` |

Sample `200` Response:

Response from the model.

```json
{
  "ok": true,
  "output": "Je m'appelle Walter"
}
```

Sample `400` Response:

Response when the request source is missing.

```json
{
  "ok": false,
  "error": "source is required."
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
