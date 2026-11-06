# 📥 Node.js Email Testing Inbox Function

Stores mail sent to your project's `appwrite.email` domain in an Appwrite table, and deletes old mail every night.

This is the companion function of the [Catchall](https://github.com/appwrite/templates-for-sites/tree/main/tanstack-start/email-testing) site template, a shared email testing inbox built on Appwrite Sites. The site's `/setup` deploys this function, turns on its email trigger and sets its schedule, so you don't need to create it yourself.

The function doesn't create anything on its own. It expects the database, tables and bucket that the site's `/setup` creates, and fails without them:

- The `catchall` database
- The `messages` table, with one row per message
- The `settings` table, whose `settings` row holds the retention period in the `retentionDays` column
- The `attachments` bucket

The IDs are fixed in `src/main.js`. The column definitions are in the site's [`src/server/schema.ts`](https://github.com/appwrite/templates-for-sites/blob/main/tanstack-start/email-testing/src/server/schema.ts).

## 🧰 Usage

### Email trigger

Runs for each email sent to any address at `inbox-<project-id>.appwrite.email`. Email triggers are available on Appwrite Cloud only.

For each email, the function:

- Stores the message as a row in the `messages` table: the sender, subject, text, HTML, headers and spam score, with the verification code and links it finds.
- Picks the code that sits right after wording such as "code:" or "your code is", or on its own line under it. When two values are placed alike, a 6-digit one wins.
- Uploads each attachment to the `attachments` bucket.
- Skips a message it already stored. Appwrite retries an email when an execution times out, so the row ID comes from the email's Message-ID and the recipient.
- Deletes the attachments it uploaded if the message can't be stored, so a retry doesn't leave a second copy in the bucket.

**Response**

Sample `200` Response:

```json
{ "ok": true, "rowId": "9f2c6d...41ab" }
```

Sample `200` Response for a message that was already stored:

```json
{ "ok": true, "duplicate": true, "rowId": "9f2c6d...41ab" }
```

### Schedule

Runs on the function's CRON schedule. Deletes messages older than the retention period, with their attachments. The retention period is 7 days when the `settings` row doesn't exist. If the row can't be read for any other reason, the run stops and deletes nothing.

A message is deleted only once all its attachments are deleted. If an attachment can't be deleted, the message stays, and the next run tries again. `kept` counts these messages. A run stops deleting after 45 seconds, and the next run continues.

**Response**

Sample `200` Response:

```json
{ "ok": true, "removed": 12, "kept": 0, "days": 7 }
```

### Other triggers

The function handles only the email trigger and the schedule. Any other trigger, such as an HTTP request, gets a `400`.

Sample `400` Response:

```json
{ "ok": false, "message": "Nothing to do for trigger \"http\"." }
```

## ⚙️ Configuration

| Setting           | Value                                    |
| ----------------- | ---------------------------------------- |
| Runtime           | Node (22)                                |
| Entrypoint        | `src/main.js`                            |
| Build Commands    | `npm install`                            |
| Permissions       | None                                     |
| Email trigger     | On                                       |
| CRON              | `0 3 * * *`                              |
| Timeout (Seconds) | 60                                       |
| Scopes            | `rows.read`, `rows.write`, `files.write` |

> Permissions are empty on purpose, so nobody can execute the function through the API. Email and the schedule still trigger it.

## 🔒 Environment Variables

No environment variables required.
