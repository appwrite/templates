# 💳 Node.js Lemon Squeezy Payments Function

Appwrite Function to receive payments in Lemon Squeezy and store paid orders.

## 🧰 Usage

### `POST /checkout`

This endpoint creates a Lemon Squeezy checkout. The user ID is fetched from the headers of the request. If the user ID is not found or a Lemon Squeezy checkout fails, the request will be redirected to a failure URL.

**Parameters**

| Name               | Description                                               | Location | Type               | Sample Value                |
| ------------------ | --------------------------------------------------------- | -------- | ------------------ | --------------------------- |
| x-appwrite-user-id | User ID from Appwrite.                                    | Header   | String             | 642...7cd                   |
| Content-Type       | The content type of the request body                      | Header   | `application/json` | N/A                         |
| failureUrl         | The URL to redirect to after a cancelled payment attempt. | Body     | String             | https://example.com/failure |

**Response**

Sample `303` Response:

The response is a redirect to the Lemon Squeezy checkout URL or to the failure URL if an error occurs

```text
Location: https://ap...re.lemonsqueezy.com/checkout/custom/7576abf3-...e2fb
```

```text
Location: https://mywebapp.com/cancel
```

### `POST /webhook`

This endpoint is a webhook that handles Lemon Squeezy event `order_created`. It validates the incoming request using the `X-Signature` header from the Lemon Squeezy webhook. If the validation fails, a `401` response is sent.

**Parameters**

| Name        | Description                         | Location | Type   | Sample Value                                                                                                                    |
| ----------- | ----------------------------------- | -------- | ------ | ------------------------------------------------------------------------------------------------------------------------------- |
| None        | Webhook payload from Lemon Squeezy. | Body     | Object | [See Lemon Squeezy docs](https://docs.lemonsqueezy.com/api/orders#the-order-object)                                             |
| x-signature | Signature from Lemon Squeezy.       | Headers  | String | [See Lemon Squeezy docs](https://docs.lemonsqueezy.com/guides/developer-guide/webhooks#signing-and-validating-webhook-requests) |

**Response**

Sample `200` Response:

In case of `order_created` event, document for the order is created in Appwrite Database.

```json
{ "success": true }
```

Sample `401` Response:

```json
{ "success": false }
```

## ⚙️ Configuration

| Setting           | Value                          |
| ----------------- | ------------------------------ |
| Runtime           | Node (18.0)                    |
| Entrypoint        | `src/main.js`                  |
| Build Commands    | `npm install && npm run setup` |
| Permissions       | `any`                          |
| Timeout (Seconds) | 15                             |

> If using a demo web app to create order, make sure to add your function domain as a web platform to your Appwrite project. Doing this fixes CORS errors and allows proper functionality.

## 🔒 Environment Variables

### APPWRITE_DATABASE_ID

The ID of the database to store the orders.

| Question     | Answer   |
| ------------ | -------- |
| Required     | No       |
| Sample Value | `orders` |

### APPWRITE_COLLECTION_ID

The ID of the collection to store the orders.

| Question     | Answer   |
| ------------ | -------- |
| Required     | No       |
| Sample Value | `orders` |

### LEMON_SQUEEZY_API_KEY

API key for sending requests to the Lemon Squeezy API.

| Question      | Answer                                                                      |
| ------------- | --------------------------------------------------------------------------- |
| Required      | Yes                                                                         |
| Sample Value  | `eyJ0eXAiOiJ...`                                                            |
| Documentation | [Lemon Squeezy: API Keys](https://docs.lemonsqueezy.com/api#authentication) |

### LEMON_SQUEEZY_WEBHOOK_SECRET

Secret used to validate the Lemon Squuezy Webhook signature.

| Question      | Answer                                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                         |
| Sample Value  | `abcd...`                                                                                                   |
| Documentation | [Lemon Squeezy: Webhooks](https://docs.lemonsqueezy.com/guides/developer-guide/webhooks#from-the-dashboard) |

### LEMON_SQUEEZY_STORE_ID

Store ID required to create a checkout using the Lemon Squeezy API.

| Question      | Answer                                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                                              |
| Sample Value  | `123456`                                                                                                                         |
| Documentation | [Lemon Squeezy: Checkouts](https://docs.lemonsqueezy.com/guides/developer-guide/taking-payments#creating-checkouts-with-the-api) |

### LEMON_SQUEEZY_VARIANT_ID

Variant ID of a product required to create a checkout using the Lemon Squeezy API.

| Question      | Answer                                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                                              |
| Sample Value  | `123456`                                                                                                                         |
| Documentation | [Lemon Squeezy: Checkouts](https://docs.lemonsqueezy.com/guides/developer-guide/taking-payments#creating-checkouts-with-the-api) |
