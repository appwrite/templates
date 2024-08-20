# ⚡ Node.js Sync with Pinecone Function

Syncs documents in an Appwrite database collection to the Pinecone vector database.

## 🧰 Usage

### GET /

Returns HTML page where search can be performed to test the indexing.

### POST /

Triggers indexing of the Appwrite database collection to Pinecone.

**Response**

Sample `204` Response: No content.

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

The admin API key for Meilisearch. Used to create the index and sync the documents from Appwrite.

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

API Key for OpenAI API. Used to generate the embeddings for the documents.

| Question      | Answer                                                   |
| ------------- | -------------------------------------------------------- |
| Required      | Yes                                                      |
| Sample Value  | `searchKey1234`                                          |
| Documentation | [OpenAI: API Keys](https://platform.openai.com/api-keys) |
