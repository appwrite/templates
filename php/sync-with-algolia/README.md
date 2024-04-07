# 🔍 PHP Sync with Algolia Function

Intuitive search bar for any data in Appwrite Databases.

## 🧰 Usage

### GET /

HTML form for interacting with the function.

### POST /

Triggers indexing of the Appwrite database collection to Algolia.

No parameters required.

**Response**

Sample `204` Response: No content.

## ⚙️ Configuration

| Setting           | Value              |
| ----------------- | ------------------ |
| Runtime           | PHP (8.0)          |
| Entrypoint        | `src/index.php`    |
| Build Commands    | `composer install` |
| Permissions       | `any`              |
| Timeout (Seconds) | 15                 |

## 🔒 Environment Variables

### APPWRITE_API_KEY

The API Key to talk to Appwrite backend APIs.

| Question      | Answer                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                |
| Sample Value  | `d1efb...aec35`                                                                                    |
| Documentation | [Appwrite: Getting Started for Server](https://appwrite.io/docs/advanced/platform/api-keys) |

### APPWRITE_DATABASE_ID

The ID of the Appwrite database that contains the collection to sync.

| Question      | Answer                                                    |
| ------------- | --------------------------------------------------------- |
| Required      | Yes                                                       |
| Sample Value  | `64a55...7b912`                                           |
| Documentation | [Appwrite: Databases](https://appwrite.io/docs/databases) |

### APPWRITE_COLLECTION_ID

The ID of the collection in the Appwrite database to sync.

| Question      | Answer                                                        |
| ------------- | ------------------------------------------------------------- |
| Required      | Yes                                                           |
| Sample Value  | `7c3e8...2a9f1`                                               |
| Documentation | [Appwrite: Collections](https://appwrite.io/docs/products/databases/collections) |

### APPWRITE_ENDPOINT

The URL endpoint of the Appwrite server. If not provided, it defaults to the Appwrite Cloud server: `https://cloud.appwrite.io/v1`.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | No                             |
| Sample Value | `https://cloud.appwrite.io/v1` |

### ALGOLIA_APP_ID

The application ID for your Algolia service.

| Question     | Answer      |
| ------------ | ----------- |
| Required     | Yes         |
| Sample Value | `EG6...VJJ` |

### ALGOLIA_ADMIN_API_KEY

The admin API Key for your Algolia service.

| Question      | Answer                                                                     |
| ------------- | -------------------------------------------------------------------------- |
| Required      | Yes                                                                        |
| Sample Value  | `fd0aa...136a8`                                                            |
| Documentation | [Algolia: API Keys](https://www.algolia.com/doc/guides/security/api-keys/) |

### ALGOLIA_INDEX_ID

The ID of the index in Algolia where the documents are to be synced.

| Question     | Answer           |
| ------------ | ---------------- |
| Required     | Yes              |
| Sample Value | `appwrite_index` |

### ALGOLIA_SEARCH_API_KEY

The search API Key for your Algolia service. This key is used for searching the synced index.

| Question      | Answer                                                                     |
| ------------- | -------------------------------------------------------------------------- |
| Required      | Yes                                                                        |
| Sample Value  | `bf2f5...df733`                                                            |
| Documentation | [Algolia: API Keys](https://www.algolia.com/doc/guides/security/api-keys/) |
