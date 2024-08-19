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

### MAX_PASSWORD_AGE

The maximum number of days a password can be used before the user is forced to change it.

| Question      | Answer                |
| ------------- | --------------------- |
| Required      | No                    |
| Default Value | `90`                  |
| Sample Value  | `https://short.app/s` |
