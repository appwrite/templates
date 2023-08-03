# ⚡ URL Shortener Function

Stores a short ID in a database and redirect to the original URL when the short ID is visited.

## 🧰 Usage

### `GET /:shortId`

Redirects to shortId's original URL.

**Parameters**

| Name    | Description                      | Location | Type   | Sample Value |
| ------- | -------------------------------- | -------- | ------ | ------------ |
| shortId | Short ID to lookup original URL. | Path     | String | `s63j2W`     |

**Response**

Sample `302` Response:

Redirects to the original URL.

```text
Location: https://mywebapp.com/pages/hugelongurl?with=query&params=123
```

Sample `404` Response:

When no URL is found for the short ID.

```text
Not Found.
```

### `POST /`

Create a new short ID for a URL.

**Parameters**

| Name         | Description         | Location | Type               | Sample Value                                                   |
| ------------ | ------------------- | -------- | ------------------ | -------------------------------------------------------------- |
| Content-Type | Content type        | Header   | `application/json` |
| url          | Long URL to shorten | Body     | String             | `https://mywebapp.com/pages/hugelongurl?with=query&params=123` |

**Response**

Sample `200` Response:

Returns the short URL and the original URL. The short URL is constructed from the SHORT_BASE_URL variable and the short ID.

```json
{
  "short": "https://mywebapp.com/short/s63j2W",
  "url": "https://mywebapp.com/pages/hugelongurl?with=query&params=123"
}
```

Sample `400` Response:

When the URL parameter is missing.

```json
{
  "error": "Missing url parameter."
}
```

## ⚙️ Configuration

| Setting           | Value           |
| ----------------- | --------------- |
| Runtime           | Node (18.0)     |
| Entrypoint        | `src/main.js`   |
| Build Commands    | `npm install`   |
|                   | `npm run setup` |
| Permissions       | `any`           |
| Timeout (Seconds) | 15              |

## 🔒 Environment Variables

### APPWRITE_API_KEY

The API Key to talk to Appwrite backend APIs.

| Question      | Answer                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                |
| Sample Value  | `d1efb...aec35`                                                                                    |
| Documentation | [Appwrite: Getting Started for Server](https://appwrite.io/docs/getting-started-for-server#apiKey) |

### APPWRITE_ENDPOINT

The URL endpoint of the Appwrite server. If not provided, it defaults to the Appwrite Cloud server: `https://cloud.appwrite.io/v1`.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | No                             |
| Sample Value | `https://cloud.appwrite.io/v1` |


### APPWRITE_DATABASE_ID

The ID of the database to store the short URLs.

| Question     | Answer                        |
| ------------ | ----------------------------- |
| Required     | Yes                           |
| Sample Value | `urlShortener`                 |

### APPWRITE_COLLECTION_ID

The ID of the collection to store the short URLs.

| Question     | Answer                        |
| ------------ | ----------------------------- |
| Required     | Yes                           |
| Sample Value | `urls`                        |


### SHORT_BASE_URL

The base URL for the short URLs. The short ID will be appended to this URL.

| Question     | Answer                        |
| ------------ | ----------------------------- |
| Required     | Yes                           |
| Sample Value | `https://mywebapp.com/short/` |


