# 💳 Node.js Stripe Subscriptions Function

Integrates Stripe subscriptions into your Appwrite project. Collect card payment with the `/checkout` endpoint and check the status of a user subscription using the `Subscriptions` collection.

## 🧰 Usage

### `POST /subscribe`

This endpoint initiates a Stripe checkout session for a subscription. The user ID is fetched from the headers of the request. If the user ID is not found or a Stripe checkout session could not be created, the request will be redirected to a cancel URL.

**Parameters**

| Name               | Description            | Location | Type   | Sample Value |
| ------------------ | ---------------------- | -------- | ------ | ------------ |
| x-appwrite-user-id | User ID from Appwrite. | Header   | String | 642...7cd    |

**Response**

Sample `303` Response:

The response is a redirect to the Stripe checkout session URL or to the cancel URL if an error occurs

```text
Location: https://checkout.stripe.com/pay/cs_test_...#fidkdWxOYHwnP
```

```text
Location: https://mywebapp.com/cancel
```

### `POST /webhook`

This endpoint is a webhook that handles two types of events from Stripe: `customer.subscription.created` and `customer.subscription.deleted`. It validates the incoming request using the Stripe's validateWebhook method. If the validation fails, a `401` response is sent.

**Parameters**

| Name | Description                  | Location | Type   | Sample Value                                                          |
| ---- | ---------------------------- | -------- | ------ | --------------------------------------------------------------------- |
| None | Webhook payload from Stripe. | Body     | Object | [See Stripe documentation](https://stripe.com/docs/api/events/object) |

**Response**

Sample `200` Response:

In case of `customer.subscription.created` event, it creates a new subscription for the user.
In case of `customer.subscription.deleted` event, it deletes the subscription for the user.

```json
{ "success": true }
```

Sample `401` Response:

```json
{ "success": false }
```

## ⚙️ Configuration

| Setting           | Value           |
| ----------------- | --------------- |
| Runtime           | Node (18.0)     |
| Entrypoint        | `src/main.js`   |
| Build Commands    | `npm install`   |
| Permissions       | `any`           |
| Timeout (Seconds) | 15              |

## 🔒 Environment Variables

### APPWRITE_API_KEY

Your Appwrite project's API key.

| Question      | Answer                                                                                                                                    |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                                                       |
| Sample Value  | `083d341ee48...`                                                                                                                          |
| Documentation | [Appwrite: Create an API key](https://appwrite.io/docs/keys#:~:text=To%20create%20a%20new%20API,scope%20to%20grant%20your%20application.) |

### APPWRITE_ENDPOINT

The endpoint where your Appwrite server is located. If not provided, it defaults to the Appwrite Cloud server: `https://cloud.appwrite.io/v1`.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | No                             |
| Sample Value | `https://cloud.appwrite.io/v1` |

### STRIPE_SECRET_KEY

Secret for sending requests to the Stripe API.

| Question      | Answer                                           |
| ------------- | ------------------------------------------------ |
| Required      | Yes                                              |
| Sample Value  | `sk_test_51J...`                                 |
| Documentation | [Stripe: API Keys](https://stripe.com/docs/keys) |

### STRIPE_WEBHOOK_SECRET

Secret used to validate the Stripe Webhook signature.

| Question      | Answer                                               |
| ------------- | ---------------------------------------------------- |
| Required      | Yes                                                  |
| Sample Value  | `whsec_...`                                          |
| Documentation | [Stripe: Webhooks](https://stripe.com/docs/webhooks) |

### SUCCESS_URL

The URL to redirect to after a successful payment.

| Question      | Answer                                                                  |
| ------------- | ----------------------------------------------------------------------- |
| Required      | No                                                                      |
| Sample Value  | `https://example.com/success`                                           |
| Documentation | [Stripe: Redirects](https://stripe.com/docs/payments/checkout/redirect) |

### FAILURE_URL

The URL to redirect to after a cancelled payment attempt.

| Question      | Answer                                                                  |
| ------------- | ----------------------------------------------------------------------- |
| Required      | No                                                                      |
| Sample Value  | `https://example.com/failure`                                           |
| Documentation | [Stripe: Redirects](https://stripe.com/docs/payments/checkout/redirect) |
