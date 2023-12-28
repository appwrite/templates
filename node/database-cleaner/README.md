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

### APPWRITE_API_KEY

Your Appwrite project's API key.

| Question      | Answer                                                                                                                                    |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                                                       |
| Sample Value  | `083d341ee48...`                                                                                                                          |
| Documentation | [Appwrite: Create an API key](https://appwrite.io/docs/keys#:~:text=To%20create%20a%20new%20API,scope%20to%20grant%20your%20application.) |

### APPWRITE_ENDPOINT

The endpoint where your Appwrite server is located. If not provided, it defaults to the Appwrite Cloud server: `https://cloud.appwrite.io/v1`.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | No                             |
| Sample Value | `https://cloud.appwrite.io/v1` |

### APPWRITE_DATABASE_ID

The ID of the database to wipe documents from.

| Question     | Answer |
| ------------ | ------ |
| Required     | Yes    |
| Sample Value | `main` |

### APPWRITE_COLLECTION_ID

The ID of the collection to wipe documents from.

| Question     | Answer     |
| ------------ | ---------- |
| Required     | Yes        |
| Sample Value | `profiles` |

### RETENTION_PERIOD_DAYS

The number of days you want to retain a document. If not provided, it defaults to 30 days. Only documents older than this period will be deleted.

| Question     | Answer |
| ------------ | ------ |
| Required     | No     |
| Sample Value | `1`    |
