# ⚡ Deno Starter Function

A simple starter function. Edit `src/main.ts` to get started and create something awesome! 🚀

## 🧰 Usage

### GET /

- Returns a "Hello, World!" message.

**Response**

Sample `200` Response:

```text
Hello, World!
```

### POST, PUT, PATCH, DELETE /

- Returns a "Learn More" JSON response.

**Response**

Sample `200` Response:

```json
{
  "motto": "Build Fast. Scale Big. All in One Place.",
  "learn": "https://appwrite.io/docs",
  "connect": "https://appwrite.io/discord",
  "getInspired": "https://builtwith.appwrite.io"
}
```

## ⚙️ Configuration

| Setting           | Value                    |
|-------------------|--------------------------|
| Runtime           | Deno (1.35)              |
| Entrypoint        | `src/main.ts`            |
| Build Commands    | `deno cache src/main.ts` |
| Permissions       | `any`                    |
| Timeout (Seconds) | 15                       |

## 🔒 Environment Variables

No environment variables required.
