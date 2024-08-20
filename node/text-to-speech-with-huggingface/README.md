# Node.js Text to Speech with Hugging Face

This function uses the Hugging Face API to perform text to speech conversion. It takes an document from the Appwrite Database and sends it to the Hugging Face API for text to speech. The API returns a ID to the audio in the Appwrite bucket.

## 🧰 Usage

### POST /

**Parameters**
| Name | Description | Location | Type | Sample Value |
|------------|-------------|----------|--------|--------------|
| text | Text you want to turn into audio | Body | String | `Hello World! I am running in an Appwrite function!` |

This function also accepts body of a document from Appwrite Databases with the text field.

**Response**

Sample `200` Response:

```json
{
  "ok": true,
  "fileId": "660560a8d856801ad6f2"
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

### APPWRITE_BUCKET_ID

The ID of the storage bucket where the audio files are stored.

| Question     | Answer             |
| ------------ | ------------------ |
| Required     | No                 |
| Sample Value | `generated_speech` |

### HUGGINGFACE_ACCESS_TOKEN

Secret for sending requests to the Hugging Face API.

| Question      | Answer                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                   |
| Sample Value  | `hf_x2a...`                                                                                           |
| Documentation | [Hugging Face: API tokens](https://huggingface.co/docs/api-inference/en/quicktour#get-your-api-token) |
