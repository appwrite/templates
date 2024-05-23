# 🗄️ Node.js Query Neo4j Aura DB Function

A function to store and query warehouses, categories, and relations between them.

## 🧰 Usage

### GET /

- Create relation between a warehouse and category, and query to get the graph of all nodes and relations.

**Response**

Sample `200` Response:

```js
{
  "keys": [
    "w",
    "c"
  ],
  "records": [
    {
      "keys": [
        "w",
        "c"
      ],
      "length": 2,
      "_fields": [
        {
          "identity": {
            "low": 1,
            "high": 0
          },
          "labels": [
            "Warehouse"
          ],
          "properties": {
            "location": "Street 331, Earth",
            "capacity": 80
          },
          "elementId": "4:7facff38-9bb1-4e6f-825c-b173336d1202:1"
        },
        {
          "identity": {
            "low": 0,
            "high": 0
          },
          "labels": [
            "Category"
          ],
          "properties": {
            "name": "electronics"
          },
          "elementId": "4:7facff38-9bb1-4e6f-825c-b173336d1202:0"
        }
      ],
      "_fieldLookup": {
        "w": 0,
        "c": 1
      }
    },
    {
      "keys": [
        "w",
        "c"
      ],
      "length": 2,
      "_fields": [
        {
          "identity": {
            "low": 9,
            "high": 0
          },
          "labels": [
            "Warehouse"
          ],
          "properties": {
            "location": "Street 788, Earth",
            "capacity": 20
          },
          "elementId": "4:7facff38-9bb1-4e6f-825c-b173336d1202:9"
        },
        {
          "identity": {
            "low": 0,
            "high": 0
          },
          "labels": [
            "Category"
          ],
          "properties": {
            "name": "electronics"
          },
          "elementId": "4:7facff38-9bb1-4e6f-825c-b173336d1202:0"
        }
      ],
      "_fieldLookup": {
        "w": 0,
        "c": 1
      }
    },
    // ...
  ],
  "summary": {
    // ...
  }
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

### NEO4J_URI

The endpoint to connect to your Neo4j database.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | Yes                            |
| Sample Value | `neo4j+s://4tg4mddo.databases.neo4j.io` |

### NEO4J_PASSWORD

Authentication password to access your Neo4j database.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | Yes                            |
| Sample Value | `mCUc4PbVUQN-_NkTLJLisb6ccnwzQKKhrkF77YMctzx` |

### NEO4J_USER

Authentication user to access your Neo4j database.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | Yes                            |
| Sample Value | `neo4j` |
