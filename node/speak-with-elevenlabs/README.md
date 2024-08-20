# 📣 Node Speak with ElevenLabs Function

Turn text into speech using the ElevenLabs API and save the audio file to Appwrite storage while outputting a link to the file.

## 🧰 Usage

### GET /

HTML form for interacting with the function.

### POST /

Query the model for a completion.

**Parameters**

| Name         | Description                                                                       | Location | Type               | Sample Value                                                                                                                                    | Required |
| ------------ | --------------------------------------------------------------------------------- | -------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Content-Type | The content type of the request body                                              | Header   | `application/json` | N/A                                                                                                                                             | Yes      |
| text         | Text for the model to say                                                         | Body     | String             | ` Appwrite is a secure backend server for web, mobile, and Flutter apps, providing easy setup for database, authentication, storage, and more.` | Yes      |
| accent       | Voice's Accent, can be `american`, `british`, `african`, `australian` or `indian` | Body     | String             | `british`                                                                                                                                       | No       |
| age          | Voice's Age, can be `young`, `middle_aged` or `old`                               | Body     | String             | `young`                                                                                                                                         | No       |
| gender       | Voice's gender, can be `male` or `female`                                         | Body     | String             | `female`                                                                                                                                        | No       |

Sample `200` Response:

Response from the model.

```json
{
  "ok": true,
  "imageUrl": "https://cloud.appwrite.io/v1/storage/buckets/text_to_speech/files/66019da664270f02c20c/view?project=project_id"
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

### ELEVENLABS_API_KEY

A unique key used to authenticate with the ElevenLabs API. You can find your API key in the ElevenLabs dashboard.

| Question      | Answer                                                                      |
| ------------- | --------------------------------------------------------------------------- |
| Required      | Yes                                                                         |
| Sample Value  | `d03xxxxxxxx26`                                                             |
| Documentation | [ElevenLabs Docs](https://elevenlabs.io/docs/api-reference/getting-started) |

### APPWRITE_BUCKET_ID

The ID of the Appwrite storage bucket where the audio files will be saved.

| Question      | Answer                                                             |
| ------------- | ------------------------------------------------------------------ |
| Required      | Yes                                                                |
| Sample Value  | `66019da664270f02c20c`                                             |
| Documentation | [Appwrite Docs](https://appwrite.io/docs/products/storage/buckets) |
