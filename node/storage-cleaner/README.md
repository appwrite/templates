# 🧹 Node.js Storage Cleaner Function

Storage cleaner function to remove all files older than X number of days from the specified bucket.

## 🧰 Usage

### GET /

Remove files older than X days from the specified bucket

**Response**

Sample `200` Response: Buckets cleaned

## ⚙️ Configuration

| Setting           | Value         |
| ----------------- | ------------- |
| Runtime           | Node (18.0)   |
| Entrypoint        | `src/main.js` |
| Build Commands    | `npm install` |
| Permissions       | `any`         |
| CRON              | `0 1 * * *`   |
| Timeout (Seconds) | 900           |

## 🔒 Environment Variables

### RETENTION_PERIOD_DAYS

The number of days you want to retain a file.

| Question     | Answer |
| ------------ | ------ |
| Required     | Yes    |
| Sample Value | `1`    |

### APPWRITE_BUCKET_ID

The ID of the bucket from which the files are to be deleted.

| Question     | Answer         |
| ------------ | -------------- |
| Required     | Yes            |
| Sample Value | `652d...b4daf` |

### APPWRITE_API_KEY

API Key to talk to Appwrite backend APIs.

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
