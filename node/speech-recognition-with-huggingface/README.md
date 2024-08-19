# Speech Recognition with Hugging Face

This function uses the Hugging Face API to perform speech recognition. It takes an audio file from Appwrite storage and sends it to the Hugging Face API for speech recognition. The API returns the text and records it in the database. This function also supports receiving document events from the Appwrite Database.

## 🧰 Usage

### POST /

**Parameters**
| Name | Description | Location | Type | Sample Value |
|------------|-------------|----------|--------|--------------|
| fileId | Appwrite File ID of audio file | Body | String | `65c6319c5f34dc9638ec` |

This function also accepts body of a file event from Appwrite Storage.

**Response**

Sample `200` Response:

Text from the audio file is recognized and stored in the database.

```json
{
  "text": " going along slushy country roads and speaking to damp audiences in draughty schoolrooms day after day for a fortnight he'll have to put in an appearance at some place of worship on sunday morning and he can come to us immediately afterwards"
}
```

Sample `404` Response:

```json
{
  "error": "File not found"
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
| Events            | `buckets.*.files.*.create`     |

## 🔒 Environment Variables

### APPWRITE_BUCKET_ID

The ID of the bucket where audio is stored.

| Question     | Answer              |
| ------------ | ------------------- |
| Required     | No                  |
| Sample Value | `speech_recogition` |

### APPWRITE_DATABASE_ID

The ID of the database where the responses are stored.

| Question     | Answer |
| ------------ | ------ |
| Required     | No     |
| Sample Value | `ai`   |

### APPWRITE_COLLECTION_ID

The ID of the collection where the responses are stored.

| Question     | Answer              |
| ------------ | ------------------- |
| Required     | No                  |
| Sample Value | `speech_recogition` |

### HUGGINGFACE_ACCESS_TOKEN

Secret for sending requests to the Hugging Face API.

| Question      | Answer                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                   |
| Sample Value  | `hf_x2a...`                                                                                           |
| Documentation | [Hugging Face: API tokens](https://huggingface.co/docs/api-inference/en/quicktour#get-your-api-token) |
