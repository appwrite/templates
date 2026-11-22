# 🧹 Database Cleaner Function

Deletes documents in a database after a specified retention period.

## 🧰 Usage

### GET /

- Deletes all documents within a database that are older than the retention period.

**Response**

Sample `200` Response:

```json
{
  "message": "Collection cleaned"
}
```

## ⚙️ Configuration

| Setting           | Value                             |
| ----------------- | --------------------------------- |
| Runtime           | Python (3.12)                     |
| Entrypoint        | `src/main.py`                     |
| Build Commands    | `pip install -r requirements.txt` |
| Permissions       | `any`                             |
| Timeout (Seconds) | 15                                |

## 🔒 Environment Variables

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
