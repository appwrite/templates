# 🤖 Node.js Music Generation with Hugging Face Function

This function uses the Hugging Face API to generate music from text.

## 🧰 Usage

### POST /

**Parameters**
| Name | Description | Location | Type | Sample Value |
|------------|-------------|----------|--------|--------------|
| prompt | Prompt you want to turn into music | Body | String | `A happy lofi beat` |

This function also accepts body of a document from Appwrite Databases with the text field.

**Response**

Sample `200` Response:

```json
{
  "ok": true,
  "fileId": "61f1b1e3f4b7d"
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

The ID of the storage bucket where the music files will be stored.

| Question     | Answer            |
| ------------ | ----------------- |
| Required     | No                |
| Sample Value | `generated_music` |

### HUGGINGFACE_ACCESS_TOKEN

Secret for sending requests to the Hugging Face API.

| Question      | Answer                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                   |
| Sample Value  | `hf_x2a...`                                                                                           |
| Documentation | [Hugging Face: API tokens](https://huggingface.co/docs/api-inference/en/quicktour#get-your-api-token) |
