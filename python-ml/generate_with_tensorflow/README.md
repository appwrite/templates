# 🤖 Python Generate with TensorFlow Function

Generate text using a TensorFlow-based RNN model.

## 🧰 Usage

### GET /

HTML form for interacting with the function.

### POST /

Query the model for a text generation completion.

**Parameters**

| Name         | Description                          | Location | Type               | Sample Value       |
| ------------ | ------------------------------------ | -------- | ------------------ | ------------------ |
| Content-Type | The content type of the request body | Header   | `application/json` | N/A                |
| prompt       | Text to prompt the model             | Body     | String             | `Once upon a time` |

Sample `200` Response:

Response from the model.

```json
{
  "ok": true,
  "completion": "Once upon a time, in a land far, far away, there lived a wise old owl."
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

| Setting           | Value                                                    |
| ----------------- | -------------------------------------------------------- |
| Runtime           | Python ML (3.11)                                         |
| Entrypoint        | `src/main.py`                                            |
| Build Commands    | `pip install -r requirements.txt && python src/train.py` |
| Permissions       | `any`                                                    |
| Timeout (Seconds) | 30                                                       |
