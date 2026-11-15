# 💳 Node.js Stripe Subscriptions Function

Receive recurring card payments and grant subscribers extra permissions.

## 🧰 Usage

### `POST /subscribe`

This endpoint initiates a Stripe checkout session for a subscription. The user ID is fetched from the headers of the request. If the user ID is not found or a Stripe checkout session could not be created, the request will be redirected to a cancel URL.

**Parameters**

| Name               | Description                                               | Location | Type               | Sample Value                |
| ------------------ | --------------------------------------------------------- | -------- | ------------------ | --------------------------- |
| x-appwrite-user-id | User ID from Appwrite.                                    | Header   | String             | 642...7cd                   |
| Content-Type       | The content type of the request body                      | Header   | `application/json` | N/A                         |
| successUrl         | The URL to redirect to after a successful payment.        | Body     | String             | https://example.com/success |
| verifyUrl          | Where the provider returns the user to verify the purchase. Defaults to `/success` on the `successUrl` origin. | Body | String | https://<function-domain>/success |
| failureUrl         | The URL to redirect to after a cancelled payment attempt. | Body     | String             | https://example.com/failure |

**Response**

Sample `303` Response:

The response is a redirect to the Stripe checkout session URL or to the cancel URL if an error occurs

```text
Location: https://checkout.stripe.com/pay/cs_test_...#fidkdWxOYHwnP
```

```text
Location: https://mywebapp.com/cancel
```

### `GET /success`

Stripe redirects the user here after checkout. Stripe adds `session_id` to the redirect URL, and this endpoint fetches the subscription from Stripe with it. It provisions the user the same way the webhook does, then redirects to the `successUrl` given to the checkout endpoint.

The webhook and this endpoint both provision the user, so either one works if the other fails. Running twice is safe: each run applies the latest status from the provider, and adding or removing a label that is already set or unset does nothing.

### `POST /webhook`

This endpoint is a webhook that handles Stripe events `customer.subscription.created`, `customer.subscription.updated` and `customer.subscription.deleted`. It validates the incoming request using the Stripe's validateWebhook method. If the validation fails, a `401` response is sent. The webhook payload isn't trusted: the function fetches the subscription from Stripe and adds or removes the `subscriber` label based on its current status.

**Parameters**

| Name | Description                  | Location | Type   | Sample Value                                                          |
| ---- | ---------------------------- | -------- | ------ | --------------------------------------------------------------------- |
| None | Webhook payload from Stripe. | Body     | Object | [See Stripe documentation](https://stripe.com/docs/api/events/object) |

**Response**

Sample `200` Response:

In case of `customer.subscription.created` event, it gives user `subscriber` label.
In case of `customer.subscription.deleted` event, it takes `subscriber` label away from user.

```json
{ "success": true }
```

Sample `401` Response:

```json
{ "success": false }
```

## ⚙️ Configuration

| Setting           | Value         |
| ----------------- | ------------- |
| Runtime           | Node (18.0)   |
| Entrypoint        | `src/main.js` |
| Build Commands    | `npm install` |
| Permissions       | `any`         |
| Timeout (Seconds) | 15            |

> If using a demo web app to subscribe, make sure to add your function domain as a web platform to your Appwrite project. Doing this fixes CORS errors and allows proper functionality.

## 🔒 Environment Variables

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
