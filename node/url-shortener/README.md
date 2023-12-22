# 🔗 Node.js URL Shortener Function

Generate URL with short ID and redirect to the original URL when visited.

## 🧰 Usage

### GET /:shortId

Redirects to shortId's original URL.

**Parameters**

| Name    | Description                      | Location | Type   | Sample Value |
| ------- | -------------------------------- | -------- | ------ | ------------ |
| shortId | Short ID to lookup original URL. | Path     | String | `discord`    |

**Response**

Sample `302` Response:

Redirects to the original URL.

```text
Location: https://discord.com/invite/GSeTUeA
```

Sample `404` Response:

When no URL is found for the short ID.

```text
Invalid link.
```

### POST /

Create a new short ID for a URL.

**Parameters**

| Name         | Description                                           | Location | Type               | Sample Value                                                   |
| ------------ | ----------------------------------------------------- | -------- | ------------------ | -------------------------------------------------------------- |
| Content-Type | Content type                                          | Header   | `application/json` |
| long         | Long URL to shorten                                   | Body     | String             | `https://mywebapp.com/pages/hugelongurl?with=query&params=123` |
| shortCode    | Short ID to use, else will be automatically generated | Body     | Optional String    | `discord`                                                      |

**Response**

Sample `200` Response:

Returns the short URL and the original URL. The short URL is constructed from the SHORT_DOMAIN and the short code.

```json
{
  "short": "https://short.app/s/discord"
}
```

Sample `400` Response:

When the URL parameter is missing.

```json
{
  "ok": false,
  "error": "Missing url parameter."
}
```

## ⚙️ Configuration

| Setting           | Value                          |
| ----------------- | ------------------------------ |
| Runtime           | Node (18.0)                    |
| Entrypoint        | `src/main.js`                  |
| Build Commands    | `npm install && npm run setup` |
| Permissions       | `any`                          |
| Timeout (Seconds) | 15                             |

## 🔒 Environment Variables

### APPWRITE_API_KEY

The API Key to talk to Appwrite backend APIs.

| Question      | Answer                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                |
| Sample Value  | `d1efb...aec35`                                                                                    |
| Documentation | [Appwrite: Getting Started for Server](https://appwrite.io/docs/advanced/platform/api-keys) |

### APPWRITE_ENDPOINT

The URL endpoint of the Appwrite server. If not provided, it defaults to the Appwrite Cloud server: `https://cloud.appwrite.io/v1`.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | No                             |
| Sample Value | `https://cloud.appwrite.io/v1` |

### APPWRITE_DATABASE_ID

The ID of the database to store the short URLs.

| Question     | Answer         |
| ------------ | -------------- |
| Required     | Yes            |
| Sample Value | `urlShortener` |

### APPWRITE_COLLECTION_ID

The ID of the collection to store the short URLs.

| Question     | Answer |
| ------------ | ------ |
| Required     | Yes    |
| Sample Value | `urls` |

### SHORT_BASE_URL

The domain to use for the short URLs. You can use your functions subdomain or a custom domain.

| Question     | Answer                |
| ------------ | --------------------- |
| Required     | Yes                   |
| Sample Value | `https://short.app/s` |
