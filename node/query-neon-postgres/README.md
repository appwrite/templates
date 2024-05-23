# 🗄️ Node.js Query Neon Postgres Function

A function to store warehouses to SQL database, and query to list them.

## 🧰 Usage

### GET /

- Save one warehouse and query to return all of them.

**Response**

Sample `200` Response:

```js
[
  {
    "id": 1,
    "location": "Street 108, Earth",
    "capacity": 50
  },
  {
    "id": 2,
    "location": "Street 675, Earth",
    "capacity": 70
  },
  // ...
]
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

### PGHOST

The endpoint to connect to your Postgres database.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | Yes                            |
| Sample Value | `ep-still-sea-a792sh84.eu-central-1.aws.neon.tech` |

### PGDATABASE

Name of our Postgres database.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | Yes                            |
| Sample Value | `main` |

### PGUSER

Name of our Postgres user for authentication.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | Yes                            |
| Sample Value | `main_owner` |

### PGPASSWORD

Password of our Postgres user for authentication.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | Yes                            |
| Sample Value | `iQCfaUaaWB3B` |

### ENDPOINT_ID

Endpoint ID provided for your Postgres database.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | Yes                            |
| Sample Value | `ep-still-sea-a792sh84` |
