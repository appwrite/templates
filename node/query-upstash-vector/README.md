# 🗄️ Node.js Query Upstash Vector Function

A function to store products to vector database, and query it for similar products.

## 🧰 Usage

### GET /

- Save one product and query for one most similar product.

**Response**

Sample `200` Response:

```js
[
  {
    "id": "18f8cb623e5115a26c8",
    "score": 0.9219918,
    "vector": [
      -0.048450675,
      0.055260602,
      -0.02373273
      // ...
    ],
    "metadata": {
      "name": "Product #115",
      "category": "electronics",
      "price": 90
    }
  }
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

### UPSTASH_URL

The endpoint to connect to your Upstash Vector database.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | Yes                            |
| Sample Value | `https://resolved-mallard-84564-eu1-vector.upstash.io` |

### UPSTASH_TOKEN

Authentication token to access your Upstash Vector database.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | Yes                            |
| Sample Value | `oe4wNTbwHVLcDNa6oceZfhBEABsCNYh43ii6Xdq4bKBH7mq7qJkUmc4cs3ABbYyuVKWZTxVQjiNjYgydn2dkhABNes4NAuDpj7qxUAmZYqGJT78` |
