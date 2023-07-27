# 🛑 Censor with Redact Function

Cesnor sensitive information from a provided text string using Redact API by Pangea.

## 🧰 Usage

### `GET`

Returns an HTML form page that can be used to enter text and see the redacted result.

### `POST`

Returns the supplied text string with sensitive information redacted.

**Parameters**

| Name         | Description                 | Location | Type               | Sample Value                                 |
| ------------ | --------------------------- | -------- | ------------------ | -------------------------------------------- |
| Content-Type | Content type of the request | Header   | `application/json` | N/A                                          |
| text         | Text to redact              | Body     | String             | `My email address is dennis.nedry@ingen.com` |

**Response**

Sample `200` Response:

Content-Type: ``

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

| Setting           | Value         |
| ----------------- | ------------- |
| Runtime           | Node (18.0)   |
| Entrypoint        | `src/main.js` |
| Build Commands    | `npm install` |
| Permissions       | `any`         |
| Timeout (Seconds) | 15            |

## 🔒 Environment Variables

### PANGEA_REDACT_TOKEN

Access token for the Pangea Redact API

| Question      | Answer                                                                                  |
| ------------- | --------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                     |
| Sample Value  | `d1efbad42adgj`                                                                         |
| Documentation | [Pangea: Configuration](https://pangea.cloud/docs/redact/getting-started/configuration) |
