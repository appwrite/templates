# Image Classification with Hugging Face

This function uses the Hugging Face API to classify images. It takes an image file from Appwrite storage and sends it to the Hugging Face API for classification. The API returns a list of labels and their scores and records it in the database. This function also supports receiving file events from Appwrite Storage.

## 🧰 Usage

### POST /

**Parameters**
| Name | Description | Location | Type | Sample Value |
|------------|-------------|----------|--------|--------------|
| imageId | Appwrite File ID of Image | Body | String | `65c6319c5f34dc9638ec` |

This function also accepts body of a file event from Appwrite Storage.

**Response**

Sample `200` Response:

Image of a dog on Appwrite Storage is sent as input and is recognized.

```json
[
  {
    "label": "Weimaraner",
    "score": 0.9862596988677979
  },
  {
    "label": "German short-haired pointer",
    "score": 0.005923726130276918
  },
  {
    "label": "Chesapeake Bay retriever",
    "score": 0.0009203946683555841
  },
  {
    "label": "vizsla, Hungarian pointer",
    "score": 0.0003758686943911016
  },
  {
    "label": "Rhodesian ridgeback",
    "score": 0.0003360954870004207
  }
]
```

Sample `404` Response:

```json
{
  "error": "Image not found"
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

The ID of the storage bucket where the images are stored.

| Question     | Answer                 |
| ------------ | ---------------------- |
| Required     | No                     |
| Sample Value | `image_classification` |

### APPWRITE_DATABASE_ID

The ID of the database where the responses are stored.

| Question     | Answer |
| ------------ | ------ |
| Required     | No     |
| Sample Value | `ai`   |

### APPWRITE_COLLECTION_ID

The ID of the collection where the responses are stored.

| Question     | Answer                 |
| ------------ | ---------------------- |
| Required     | No                     |
| Sample Value | `image_classification` |

### HUGGINGFACE_ACCESS_TOKEN

Secret for sending requests to the Hugging Face API.

| Question      | Answer                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                   |
| Sample Value  | `hf_x2a...`                                                                                           |
| Documentation | [Hugging Face: API tokens](https://huggingface.co/docs/api-inference/en/quicktour#get-your-api-token) |
