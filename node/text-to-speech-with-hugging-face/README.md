# Text to Speech with Hugging Face

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

Image of a dog on Appwrite Storage is sent as input and is recognized.

```json
{
  "id": "660560a8d856801ad6f2",
  "tts": "660560ae625f233d71b0"
}
```

Sample `404` Response:

```json
{
  "error": "Document not found"
}
```

## ⚙️ Configuration

| Setting           | Value                                          |
| ----------------- | ---------------------------------------------- |
| Runtime           | Node (18.0)                                    |
| Entrypoint        | `src/main.js`                                  |
| Build Commands    | `npm install && npm run setup`                 |
| Permissions       | `any`                                          |
| Timeout (Seconds) | 15                                             |
| Events            | `databases.*.collections.*.documents.*.create` |

## 🔒 Environment Variables

### APPWRITE_API_KEY

Your Appwrite project's API key.

| Question      | Answer                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                               |
| Sample Value  | `083d341ee48...`                                                                                  |
| Documentation | [Appwrite: Create an API key](https://appwrite.io/docs/advanced/platform/api-keys#create-api-key) |

This key should have all permissions in the `Databases` scope as well as all permissions in the `Storage` scope.

### APPWRITE_ENDPOINT

The endpoint where your Appwrite server is located. If not provided, it defaults to the Appwrite Cloud server: `https://cloud.appwrite.io/v1`.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | No                             |
| Sample Value | `https://cloud.appwrite.io/v1` |

### APPWRITE_BUCKET_ID

The ID of the storage bucket where the images are stored.

| Question     | Answer           |
| ------------ | ---------------- |
| Required     | No               |
| Sample Value | `text_to_speech` |

### APPWRITE_DATABASE_ID

The ID of the database where the responses are stored.

| Question     | Answer |
| ------------ | ------ |
| Required     | No     |
| Sample Value | `ai`   |

### APPWRITE_COLLECTION_ID

The ID of the collection where the responses are stored.

| Question     | Answer           |
| ------------ | ---------------- |
| Required     | No               |
| Sample Value | `text_to_speech` |

### HUGGING_FACE_API_KEY

Secret for sending requests to the Hugging Face API.

| Question      | Answer                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                 |
| Sample Value  | `hf_x2a...`                                                                                         |
| Documentation | [Hugging Face: API Keys](https://huggingface.co/docs/api-inference/en/quicktour#get-your-api-token) |
