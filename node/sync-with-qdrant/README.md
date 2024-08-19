# ⚡ Node.js Sync with Qdrant Function

Syncs documents in an Appwrite database collection to a [Qdrant](https://qdrant.tech/) collection.

## 🧰 Usage

### GET /

Returns an HTML page where a search can be performed to test the sync of the documents.

### POST /

Triggers sync of the Appwrite database collection to Qdrant.

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

### QDRANT_URL

The URL of the Qdrant server.

| Question      | Answer                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                |
| Documentation | [Qdrant Cloud](https://qdrant.tech/documentation/cloud/#getting-started-with-qdrant-managed-cloud) |

### QDRANT_API_KEY

The API key to authenticate requests to Qdrant cloud.

| Question      | Answer                                                                     |
| ------------- | -------------------------------------------------------------------------- |
| Required      | Yes                                                                        |
| Documentation | [Qdrant: API Keys](https://qdrant.tech/documentation/cloud/authentication) |

### QDRANT_COLLECTION_NAME

The name of the Qdrant collection to sync the documents to.

| Question      | Answer                                                                 |
| ------------- | ---------------------------------------------------------------------- |
| Required      | Yes                                                                    |
| Documentation | [Collections](https://qdrant.tech/documentation/concepts/collections/) |

### OPENAI_API_KEY

API Key for OpenAI API. Used to generate the embeddings for the documents.

| Question      | Answer                                                   |
| ------------- | -------------------------------------------------------- |
| Required      | Yes                                                      |
| Documentation | [OpenAI: API Keys](https://platform.openai.com/api-keys) |
