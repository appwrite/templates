# ⚡ Bun Sync with Meilisearch Function

Syncs documents in an Appwrite database collection to a Meilisearch index.

## 🧰 Usage

### GET /

Returns HTML page where search can be performed to test the indexing.

### POST /

Triggers indexing of the Appwrite database collection to Meilisearch.

**Response**

Sample `204` Response: No content.

## ⚙️ Configuration

| Setting           | Value         |
| ----------------- | ------------- |
| Runtime           | Bun (1.0)   |
| Entrypoint        | `src/main.ts` |
| Build Commands    | `bun install` |
| Permissions       | `any`         |
| Timeout (Seconds) | 15            |

## 🔒 Environment Variables

### APPWRITE_API_KEY

API Key to talk to Appwrite backend APIs.

| Question      | Answer                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                |
| Sample Value  | `d1efb...aec35`                                                                                    |
| Documentation | [Appwrite: Getting Started for Server](https://appwrite.io/docs/getting-started-for-server#apiKey) |

### APPWRITE_DATABASE_ID

The ID of the Appwrite database that contains the collection to sync.

| Question      | Answer                                                    |
| ------------- | --------------------------------------------------------- |
| Required      | Yes                                                       |
| Sample Value  | `612a3...5b6c9`                                           |
| Documentation | [Appwrite: Databases](https://appwrite.io/docs/databases) |

### APPWRITE_COLLECTION_ID

The ID of the collection in the Appwrite database to sync.

| Question      | Answer                                                        |
| ------------- | ------------------------------------------------------------- |
| Required      | Yes                                                           |
| Sample Value  | `7c3e8...2a9f1`                                               |
| Documentation | [Appwrite: Collections](https://appwrite.io/docs/databases#collection) |

### APPWRITE_ENDPOINT

The URL endpoint of the Appwrite server. If not provided, it defaults to the Appwrite Cloud server: `https://cloud.appwrite.io/v1`.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | No                             |
| Sample Value | `https://cloud.appwrite.io/v1` |

### MEILISEARCH_ENDPOINT

The host URL of the Meilisearch server.

| Question     | Answer                  |
| ------------ | ----------------------- |
| Required     | Yes                     |
| Sample Value | `http://127.0.0.1:7700` |

### MEILISEARCH_ADMIN_API_KEY

The admin API key for Meilisearch.

| Question      | Answer                                                                   |
| ------------- | ------------------------------------------------------------------------ |
| Required      | Yes                                                                      |
| Sample Value  | `masterKey1234`                                                          |
| Documentation | [Meilisearch: API Keys](https://docs.meilisearch.com/reference/api/keys) |

### MEILISEARCH_INDEX_NAME

Name of the Meilisearch index to which the documents will be synchronized.

| Question     | Answer     |
| ------------ | ---------- |
| Required     | Yes        |
| Sample Value | `my_index` |

### MEILISEARCH_SEARCH_API_KEY

API Key for Meilisearch search operations.

| Question      | Answer                                                                   |
| ------------- | ------------------------------------------------------------------------ |
| Required      | Yes                                                                      |
| Sample Value  | `searchKey1234`                                                          |
| Documentation | [Meilisearch: API Keys](https://docs.meilisearch.com/reference/api/keys) |
