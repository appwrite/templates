# 🗄️ Node.js Query Mongo Atlas Function

A function to store warehouses to SQL database, and query to list them.

## 🧰 Usage

### GET /

- Save one warehouse and query to return all of them.

**Response**

Sample `200` Response:

```js
[
  {
    "_id": "664897aff5fc199b80c1a132",
    "location": "Street 283, Earth",
    "capacity": 60
  },
  {
    "_id": "664897f58f2d686e85b93692",
    "location": "Street 593, Earth",
    "capacity": 60
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

### MONGO_URI

The endpoint to connect to your Mongo database.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | Yes                            |
| Sample Value | `mongodb+srv://appwrite:Yx42hafg7Q4fgkxe@cluster0.7mslfog.mongodb.net/?retryWrites=true&w=majority&appName=Appwrite` |
