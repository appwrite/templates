# 📣 Node Speak with LMNT Function

Turn text into speech using the LMNT API and save the audio file to Appwrite storage while outputting a link to the file.

## 🧰 Usage

### GET /

HTML form for interacting with the function.

### POST /

Query the model for a completion.

**Parameters**

| Name         | Description                          | Location | Type               | Sample Value                                                                                                                                    | Required |
| ------------ | ------------------------------------ | -------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Content-Type | The content type of the request body | Header   | `application/json` | N/A                                                                                                                                             | Yes      |
| text         | Text for the model to say            | Body     | String             | ` Appwrite is a secure backend server for web, mobile, and Flutter apps, providing easy setup for database, authentication, storage, and more.` | Yes      |

Sample `200` Response:

Response from the model.

```json
{
  "ok": true,
  "response": "https://cloud.appwrite.io/v1/storage/buckets/text_to_speech/files/66019da664270f02c20c/view?project=project_id"
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
| Timeout (Seconds) | 60            |

## 🔒 Environment Variables

### LMNT_API_KEY

A unique key used to authenticate with the LMNT API. You can find your API key in the LMNT dashboard.

| Question      | Answer                                                               |
| ------------- | -------------------------------------------------------------------- |
| Required      | Yes                                                                  |
| Sample Value  | `d03xxxxxxxx26`                                                      |
| Documentation | [LMNT Docs](https://docs.lmnt.com/getting-started/environment-setup) |

### APPWRITE_BUCKET_ID

The ID of the Appwrite storage bucket where the audio files will be saved.

| Question      | Answer                                                             |
| ------------- | ------------------------------------------------------------------ |
| Required      | Yes                                                                |
| Sample Value  | `66019da664270f02c20c`                                             |
| Documentation | [Appwrite Docs](https://appwrite.io/docs/products/storage/buckets) |
