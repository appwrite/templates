# Object Detection with Hugging Face

This function uses the Hugging Face API to detect objects. It takes an image file from Appwrite storage and sends it to the Hugging Face API for object detection. The API returns a list of labels and their scores and records it in the database. This function also supports receiving file events from Appwrite Storage.

## 🧰 Usage

### POST /

**Parameters**
| Name | Description | Location | Type | Sample Value |
|------------|-------------|----------|--------|--------------|
| imageId | Appwrite File ID of Image | Body | String | `65c6319c5f34dc9638ec` |

This function also accepts body of a file event from Appwrite Storage.

**Response**

Sample `200` Response:

Image of an airport on Appwrite Storage is sent as input and is recognized.

```json
[
  {
    "score": 0.998191773891449,
    "label": "person",
    "box": {
      "xmin": 870,
      "ymin": 463,
      "xmax": 895,
      "ymax": 540
    }
  },
  {
    "score": 0.9406785368919373,
    "label": "person",
    "box": {
      "xmin": 452,
      "ymin": 395,
      "xmax": 470,
      "ymax": 425
    }
  },
  {
    "score": 0.9969456791877747,
    "label": "person",
    "box": {
      "xmin": 428,
      "ymin": 568,
      "xmax": 466,
      "ymax": 667
    }
  },
  {
    "score": 0.9682687520980835,
    "label": "person",
    "box": {
      "xmin": 443,
      "ymin": 394,
      "xmax": 462,
      "ymax": 421
    }
  },
  {
    "score": 0.9888055324554443,
    "label": "truck",
    "box": {
      "xmin": 0,
      "ymin": 467,
      "xmax": 459,
      "ymax": 713
    }
  },
  {
    "score": 0.9973268508911133,
    "label": "airplane",
    "box": {
      "xmin": 498,
      "ymin": 110,
      "xmax": 1409,
      "ymax": 417
    }
  },
  {
    "score": 0.9892668724060059,
    "label": "person",
    "box": {
      "xmin": 1039,
      "ymin": 444,
      "xmax": 1064,
      "ymax": 513
    }
  },
  {
    "score": 0.9430725574493408,
    "label": "person",
    "box": {
      "xmin": 463,
      "ymin": 394,
      "xmax": 480,
      "ymax": 422
    }
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

| Question     | Answer             |
| ------------ | ------------------ |
| Required     | No                 |
| Sample Value | `object_detection` |

### APPWRITE_DATABASE_ID

The ID of the database where the responses are stored.

| Question     | Answer |
| ------------ | ------ |
| Required     | No     |
| Sample Value | `ai`   |

### APPWRITE_COLLECTION_ID

The ID of the collection where the responses are stored.

| Question     | Answer             |
| ------------ | ------------------ |
| Required     | No                 |
| Sample Value | `object_detection` |

### HUGGINGFACE_ACCESS_TOKEN

Secret for sending requests to the Hugging Face API.

| Question      | Answer                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                   |
| Sample Value  | `hf_x2a...`                                                                                           |
| Documentation | [Hugging Face: API tokens](https://huggingface.co/docs/api-inference/en/quicktour#get-your-api-token) |
