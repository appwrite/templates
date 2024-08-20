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

### APPWRITE_DATABASE_ID

The ID of the Appwrite database that contains the collection to sync.

| Question      | Answer                                                    |
| ------------- | --------------------------------------------------------- |
| Required      | Yes                                                       |
| Sample Value  | `612a3...5b6c9`                                           |
| Documentation | [Appwrite: Databases](https://appwrite.io/docs/databases) |

### APPWRITE_COLLECTION_ID

The ID of the collection in the Appwrite database to sync.

| Question      | Answer                                                                 |
| ------------- | ---------------------------------------------------------------------- |
| Required      | Yes                                                                    |
| Sample Value  | `7c3e8...2a9f1`                                                        |
| Documentation | [Appwrite: Collections](https://appwrite.io/docs/databases#collection) |

### PINECONE_API_KEY

The admin API key for Meilisearch. Used to create the index, sync the documents from Appwrite and perform similarity searches.

| Question      | Answer                                                                               |
| ------------- | ------------------------------------------------------------------------------------ |
| Required      | Yes                                                                                  |
| Sample Value  | `masterKey1234`                                                                      |
| Documentation | [Pinecone: API Keys](https://docs.pinecone.io/guides/getting-started/authentication) |

### PINECONE_INDEX_ID

The ID of the Pinecone index to sync the documents to.

| Question      | Answer                                                                       |
| ------------- | ---------------------------------------------------------------------------- |
| Required      | Yes                                                                          |
| Sample Value  | `index1234`                                                                  |
| Documentation | [Pinecone: Indexes](https://docs.pinecone.io/guides/indexes/create-an-index) |

### OPENAI_API_KEY

API Key for OpenAI API. Used to generate the embeddings for the documents, and query the RAG model.

| Question      | Answer                                                   |
| ------------- | -------------------------------------------------------- |
| Required      | Yes                                                      |
| Sample Value  | `searchKey1234`                                          |
| Documentation | [OpenAI: API Keys](https://platform.openai.com/api-keys) |
