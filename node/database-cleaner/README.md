# 🧹 Database Cleaner Function

Deletes documents in a database after a specified retention period.

## 🧰 Usage

### GET /

- Deletes all documents within a database that are older than the retention period.

**Response**

Sample `200` Response: Cleaning Finished.

## ⚙️ Configuration

| Setting           | Value         |
| ----------------- | ------------- |
| Runtime           | Node (18.0)   |
| Entrypoint        | `src/main.js` |
| Build Commands    | `npm install` |
| Permissions       | `any`         |
| Timeout (Seconds) | 15            |

## 🔒 Environment Variables

### RETENTION_PERIOD_DAYS

The number of days you want to retain a document.

| Question     | Answer |
| ------------ | ------ |
| Required     | Yes    |
| Sample Value | `1`    |

### APPWRITE_DATABASE_ID

The ID of the Appwrite database that contains the collection to clean.

| Question      | Answer                                                    |
| ------------- | --------------------------------------------------------- |
| Required      | Yes                                                       |
| Sample Value  | `612a3...5b6c9`                                           |
| Documentation | [Appwrite: Databases](https://appwrite.io/docs/databases) |

### APPWRITE_API_KEY

API Key to talk to Appwrite backend APIs.

| Question      | Answer                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                |
| Sample Value  | `d1efb...aec35`                                                                                    |
| Documentation | [Appwrite: Getting Started for Server](https://appwrite.io/docs/getting-started-for-server#apiKey) |

### APPWRITE_ENDPOINT

The URL endpoint of the Appwrite server. If not provided, it defaults to the Appwrite Cloud server: `https://cloud.appwrite.io/v1`.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | Yes                            |
| Sample Value | `https://cloud.appwrite.io/v1` |

### APPWRITE_FUNCTION_PROJECT_ID

The ID of the Appwrite project.

| Question     | Answer          |
| ------------ | --------------- |
| Required     | Yes             |
| Sample Value | `6525e...d44e3` |
