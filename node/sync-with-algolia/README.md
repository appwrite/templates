# ⚡ Sync With Algolia Function

Dyncs documents in an Appwrite database collection to an Algolia index.

## 🧰 Usage

### `GET /`

Returns a HTML page where search can be performed to test the indexing.


### `POST /`

Triggers indexing of the Appwrite database collection to Algolia.

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

### APPWRITE_API_KEY

The API Key to talk to Appwrite backend APIs.

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
| Documentation | [Appwrite: Collections](https://appwrite.io/docs/collections) |

### APPWRITE_ENDPOINT

The URL endpoint of the Appwrite server. If not provided, it defaults to the Appwrite Cloud server: `https://cloud.appwrite.io/v1`.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | No                             |
| Sample Value | `https://cloud.appwrite.io/v1` |

### APPWRITE_PROJECT_ID

The ID of the Appwrite project associated with the function.

| Question     | Answer              |
| ------------ | ------------------- |
| Required     | Yes                 |
| Sample Value | `builtWithAppwrite` |

### ALGOLIA_APP_ID

The application ID for your Algolia service.

| Question     | Answer             |
| ------------ | ------------------ |
| Required     | Yes                |
| Sample Value | `YourAlgoliaAppId` |

### ALGOLIA_ADMIN_API_KEY

The admin API Key for your Algolia service.

| Question      | Answer                                                                     |
| ------------- | -------------------------------------------------------------------------- |
| Required      | Yes                                                                        |
| Sample Value  | `YourAlgoliaAdminApiKey`                                                   |
| Documentation | [Algolia: API Keys](https://www.algolia.com/doc/guides/security/api-keys/) |

### ALGOLIA_INDEX_ID

The ID of the index in Algolia where the documents are to be synced.

| Question     | Answer               |
| ------------ | -------------------- |
| Required     | Yes                  |
| Sample Value | `YourAlgoliaIndexId` |

### ALGOLIA_SEARCH_API_KEY

The search API Key for your Algolia service. This key is used for searching the synced index.

| Question      | Answer                                                                     |
| ------------- | -------------------------------------------------------------------------- |
| Required      | Yes                                                                        |
| Sample Value  | `YourAlgoliaSearchApiKey`                                                  |
| Documentation | [Algolia: API Keys](https://www.algolia.com/doc/guides/security/api-keys/) |
