# 🚨 Node.js Uptime Incident Log Function

Turns uptime monitor alerts (HTTP, DNS, TCP and SMTP checks) into incident rows in a table, and tells a Messaging topic's subscribers when a service goes down and comes back.

## 🧰 Usage

### Event: `monitors.*.alerts.*.firing`, `monitors.*.alerts.*.resolved`

On the first alert, the template creates the `status` database and its `incidents` table. Then it keeps one row per alert, under the alert's ID:

| Column            | Value                                           |
| ----------------- | ----------------------------------------------- |
| `monitorId`       | Monitor that raised the alert                   |
| `name`            | Monitor name                                    |
| `type`            | `http`, `dns`, `tcp` or `smtp`                  |
| `status`          | `firing`, then `resolved`                       |
| `severity`        | Monitor severity                                |
| `result`          | What the failing check found, such as `timeout` |
| `startedAt`       | When the alert fired                            |
| `resolvedAt`      | When it resolved                                |
| `downtimeSeconds` | How long it was down                            |

A status page can list the rows, or subscribe to them with Realtime. The table is private: grant `read("any")` on it from the console to read it from a public page.

When `MESSAGING_TOPIC_ID` is set, each change is also sent to that topic, by email, SMS and push, each only if the topic has subscribers of that kind.

Usage alerts are ignored. Calls that aren't alert events, such as an HTTP request to the function's domain, get a `403`.

**Response**

Sample `200` Response:

```json
{ "recorded": true, "incident": "6745f0a1c3e2b7d4a9f0", "notified": ["email"] }
```

## ⚙️ Configuration

| Setting           | Value                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Runtime           | Node (20.0)                                                                                                                    |
| Entrypoint        | `src/main.js`                                                                                                                  |
| Build Commands    | `npm install`                                                                                                                  |
| Permissions       | None                                                                                                                           |
| Events            | `monitors.*.alerts.*.firing`, `monitors.*.alerts.*.resolved`                                                                   |
| Timeout (Seconds) | 15                                                                                                                             |
| Scopes            | `databases.read`, `databases.write`, `tables.read`, `tables.write`, `rows.read`, `rows.write`, `topics.read`, `messages.write` |

## 🔒 Environment Variables

### APPWRITE_DATABASE_ID

ID of the database for the incidents table. Created if it doesn't exist.

| Question     | Answer   |
| ------------ | -------- |
| Required     | No       |
| Sample Value | `status` |

### APPWRITE_TABLE_ID

ID of the incidents table. Created if it doesn't exist.

| Question     | Answer      |
| ------------ | ----------- |
| Required     | No          |
| Sample Value | `incidents` |

### MESSAGING_TOPIC_ID

ID of the Messaging topic to notify. Leave it empty to only record incidents.

| Question      | Answer                                                                 |
| ------------- | ---------------------------------------------------------------------- |
| Required      | No                                                                     |
| Sample Value  | `status-updates`                                                       |
| Documentation | [Appwrite: Topics](https://appwrite.io/docs/products/messaging/topics) |

## 📝 Notes

- Events are delivered at least once. A repeated event updates the same row, and each message has a fixed ID per incident and state, so subscribers aren't notified twice.
- A late firing event never reopens a resolved incident.
