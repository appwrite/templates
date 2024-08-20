# 🤖 Generate with Together AI

Generate text and images using Together AI's API.

## 🧰 Usage

### GET /

HTML form for interacting with the function.

### POST /

Query the model for a completion.

**Parameters**

| Name         | Description                                                  | Location | Type               | Sample Value                  |
| ------------ | ------------------------------------------------------------ | -------- | ------------------ | ----------------------------- |
| Content-Type | The content type of the request body                         | Header   | `application/json` | N/A                           |
| prompt       | Text to prompt the model                                     | Body     | String             | `Write a haiku about Mondays` |
| type         | The type of completion to generate, can be `text` or `image` | Body     | String             | `text`                        |

Sample `200` Response:

Response from the model.

```json
{
  "ok": true,
  "response": "Monday's heavy weight, Dawning with a sigh of grey, Hopeful hearts await.",
  "type": "text"
}
```

If you request an image the result will be uploaded to Appwrite Storage and the URL to access it will be returned. Make sure the bucket you give the function is setup to allow `any` read access for the front end to work.

```json
{
  "ok": true,
  "type": "image",
  "response": "https://cloud.appwrite.io/v1/storage/buckets/together/files/661e173537dedbeec3cd/view?project=test"
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
| Timeout (Seconds) | 900           |

## 🔒 Environment Variables

### TOGETHER_API_KEY

A unique key used to authenticate with the Together AI API. Please note that this is a paid service and you will be charged for each request made to the API. For more information, see the [Together AI pricing page](https://together.ai/pricing).

| Question      | Answer                                                       |
| ------------- | ------------------------------------------------------------ |
| Required      | Yes                                                          |
| Sample Value  | `r8_......`                                                  |
| Documentation | [Together AI Docs](https://docs.together.ai/docs/quickstart) |

### APPWRITE_BUCKET_ID

The ID of the Appwrite storage bucket where the image files will be saved. It must have permissions set for `any` read access for the front-end to work.

| Question      | Answer                                                             |
| ------------- | ------------------------------------------------------------------ |
| Required      | Yes                                                                |
| Sample Value  | `66019da664270f02c20c`                                             |
| Documentation | [Appwrite Docs](https://appwrite.io/docs/products/storage/buckets) |
