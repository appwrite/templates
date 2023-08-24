# 🤐 Python Censor with Redact Function

Automatically remove sensitive data from messages.

## 🧰 Usage

### GET /

HTML form for interacting with the function.

### POST /

Returns the supplied text string with sensitive information redacted.

**Parameters**

| Name         | Description                 | Location | Type               | Sample Value                               |
| ------------ | --------------------------- | -------- | ------------------ | ------------------------------------------ |
| Content-Type | Content type of the request | Header   | `application/json` | N/A                                        |
| text         | Text to redact              | Body     | String             | `My email address is myname2000@gmail.com` |

**Response**

Sample `200` Response:

```json
{
  "ok": true,
  "redacted": "My email address is <EMAIL_ADDRESS>"
}
```

Sample `400` Response:

```json
{
  "ok": false,
  "error": "Missing required field: text."
}
```

## ⚙️ Configuration

| Setting           | Value                             |
| ----------------- | --------------------------------- |
| Runtime           | Python (3.9)                      |
| Entrypoint        | `src/main.py`                     |
| Build Commands    | `pip install -r requirements.txt` |
| Permissions       | `any`                             |
| Timeout (Seconds) | 15                                |

## 🔒 Environment Variables

### PANGEA_REDACT_TOKEN

Access token for the Pangea Redact API

| Question      | Answer                                                                                  |
| ------------- | --------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                     |
| Sample Value  | `pts_7p4...5wl4`                                                                        |
| Documentation | [Pangea: Configuration](https://pangea.cloud/docs/redact/getting-started/configuration) |
