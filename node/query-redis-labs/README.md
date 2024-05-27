# 🗄️ Node.js Query Redis Labs Function

A function to store warehouse to key-value database, and query to retrieve it.

## 🧰 Usage

### GET /

- Set and get a warehouse record.

**Response**

Sample `200` Response:

```js
{
  "location": "Street 49, Earth",
  "capacity": "10"
}
```

## ⚙️ Configuration

| Setting           | Value         |
| ----------------- | ------------- |
| Runtime           | Node (18.0)   |
| Entrypoint        | `src/main.js` |
| Build Commands    | `npm install` |
| Permissions       | `any`         |
| Timeout (Seconds) | 15            |

## 🔒 Environment Variables

### REDIS_HOST

The endpoint to connect to your Redis database.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | Yes                            |
| Sample Value | `redis-13258.c35.eu-central-1-1.ec2.redns.redis-cloud.com` |

### REDIS_PASSWORD

Authentication password to access your Redis database.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | Yes                            |
| Sample Value | `efNNehiACfcZiwsTAjcK6xiwPyu6Dpdq` |
