# ⚡ Node.js Password Expiry Function

Send an email to remind users to change their password on a regular interval.

## 🧰 Usage

### /

- Send an email to remind users to change their password on a regular interval. If the function fails, the users that failed to receive an email will be logged in console.

**Response**

Sample `200` Response:

```json
{
  "ok": true
}
```

Sample `500` Response:

```json
{
  "ok": false
}
```

## ⚙️ Configuration

You can set CRON to control how often the function is executed. For example, `0 0 * * *` will run the function every day at midnight.

| Setting           | Value         |
| ----------------- | ------------- |
| Runtime           | Node (18.0)   |
| Entrypoint        | `src/main.js` |
| Build Commands    | `npm install` |
| Permissions       | `any`         |
| CRON              | `0 0 * * *`   |
| Timeout (Seconds) | 15            |

## 🔒 Environment Variables

### APPWRITE_API_KEY

The API Key to talk to Appwrite backend APIs.

| Question      | Answer                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                |
| Sample Value  | `d1efb...aec35`                                                                                    |
| Documentation | [Appwrite: Getting Started for Server](https://appwrite.io/docs/getting-started-for-server#apiKey) |

### APPWRITE_ENDPOINT

The URL endpoint of the Appwrite server. If not provided, it defaults to the Appwrite Cloud server: `https://cloud.appwrite.io/v1`.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | No                             |
| Sample Value | `https://cloud.appwrite.io/v1` |

### MAX_PASSWORD_AGE

The maximum number of days a password can be used before the user is forced to change it.

| Question      | Answer                |
| ------------- | --------------------- |
| Required      | No                    |
| Default Value | `90`                  |
| Sample Value  | `https://short.app/s` |
