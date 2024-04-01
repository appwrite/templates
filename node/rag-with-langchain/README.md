# 🤖 Node RAG with LangChain Function

A retrieval augmented generation (RAG) model for completions with the LangChain API, which provides a simple interface for querying the model. An endpoint is provided for indexing data from an Appwrite collection to a Pinecone vector database.

## 🧰 Usage

### GET /

HTML form for interacting with the function.

### POST /

Index data from an Appwrite collection to a Pinecone vector database. All user defined attributes are indexed as strings and appended to the vector.

### POST /prompt

Query the model for a completion, including retrieval augmentation. A similarity search is performed using LangChain to retrieve relevant documents for the context.

**Parameters**

| Name         | Description                          | Location | Type               | Sample Value                  |
| ------------ | ------------------------------------ | -------- | ------------------ | ----------------------------- |
| Content-Type | The content type of the request body | Header   | `application/json` | N/A                           |
| prompt       | Text to prompt the model             | Body     | String             | `Write a haiku about Mondays` |

Sample `200` Response:

Response from the model.

```json
{
    "ok": true,
    "completion": "Monday's heavy weight, Dawning with a sigh of grey, Hopeful hearts await."
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
| Timeout (Seconds) | 15            |

## 🔒 Environment Variables

### OPENAI_API_KEY

A unique key used to authenticate with the OpenAI API. Please note that this is a paid service and you will be charged for each request made to the API. For more information, see the [OpenAI pricing page](https://openai.com/pricing/).

| Question      | Answer                                                                      |
| ------------- | --------------------------------------------------------------------------- |
| Required      | Yes                                                                         |
| Sample Value  | `sk-wzG...vcy`                                                              |
| Documentation | [OpenAI Docs](https://platform.openai.com/docs/quickstart/add-your-api-key) |


