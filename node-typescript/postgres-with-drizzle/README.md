# 🐘 Node.js (TypeScript) Postgres with Drizzle Function

A todo API backed by Appwrite Postgres and Drizzle ORM.

## 🧰 Usage

### GET /

- Returns all todos.

**Response**

Sample `200` Response:

```json
{
  "ok": true,
  "todos": [
    {
      "id": 1,
      "title": "Write the docs",
      "completed": false,
      "createdAt": "2026-09-25T06:12:06.366Z"
    }
  ]
}
```

### POST /

- Creates a todo.

**Parameters**

| Name  | Description            | Location | Type   | Sample Value   |
| ----- | ---------------------- | -------- | ------ | -------------- |
| title | Title, 1 to 255 chars. | Body     | String | Write the docs |

**Response**

Sample `201` Response:

```json
{
  "ok": true,
  "todo": {
    "id": 1,
    "title": "Write the docs",
    "completed": false,
    "createdAt": "2026-09-25T06:12:06.366Z"
  }
}
```

Sample `400` Response:

```json
{ "ok": false, "error": "Title must be 1 to 255 characters." }
```

### GET /:id

- Returns a single todo.

**Response**

Sample `200` Response:

```json
{
  "ok": true,
  "todo": {
    "id": 1,
    "title": "Write the docs",
    "completed": false,
    "createdAt": "2026-09-25T06:12:06.366Z"
  }
}
```

Sample `404` Response:

```json
{ "ok": false, "error": "Todo not found." }
```

### PATCH /:id

- Updates the title or completion of a todo.

**Parameters**

| Name      | Description                | Location | Type    | Sample Value   |
| --------- | -------------------------- | -------- | ------- | -------------- |
| title     | New title, 1 to 255 chars. | Body     | String  | Write the docs |
| completed | Whether the todo is done.  | Body     | Boolean | true           |

**Response**

Sample `200` Response:

```json
{
  "ok": true,
  "todo": {
    "id": 1,
    "title": "Write the docs",
    "completed": true,
    "createdAt": "2026-09-25T06:12:06.366Z"
  }
}
```

Sample `400` Response:

```json
{ "ok": false, "error": "Provide a title or completed value." }
```

### DELETE /:id

- Deletes a todo.

**Response**

Sample `200` Response:

```json
{ "ok": true }
```

## 🗄️ Schema changes

The schema lives in `src/schema.ts`. After changing it, run `npm run db:generate` to create a migration in `drizzle/`, then redeploy. The function applies pending migrations on its first execution.

## ⚙️ Configuration

| Setting           | Value                          |
| ----------------- | ------------------------------ |
| Runtime           | Node (22)                      |
| Entrypoint        | `dist/main.js`                 |
| Build Commands    | `npm install && npm run build` |
| Permissions       | `any`                          |
| Timeout (Seconds) | 15                             |

## 🔒 Environment Variables

### DATABASE_URL

Connection string of your Appwrite Postgres database.

| Question     | Answer                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------- |
| Required     | Yes                                                                                         |
| Sample Value | `postgresql://admin:d1efb...aec35@db-8f2c61a4d7e0.fra.appwrite.center:5432/db-8f2c61a4d7e0` |
