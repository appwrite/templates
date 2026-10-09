# 💳 Node.js Subscriptions with Dodo Payments Function

Receive recurring payments with Dodo Payments and grant subscribers extra permissions.

## 🧰 Usage

### `GET /`

Serves a demo page where a user can register, subscribe and see their subscription status.

### `POST /subscribe`

This endpoint creates a [Dodo Payments checkout session](https://docs.dodopayments.com/developer-resources/checkout-session) for the subscription product in `DODO_PAYMENTS_PRODUCT_ID`. The user ID is fetched from the headers of the request and stored in the checkout metadata, which Dodo Payments copies to the subscription. If the user ID is not found or the checkout session can't be created, the request is redirected to the failure URL.

**Parameters**

| Name               | Description                                                                                       | Location | Type               | Sample Value                |
| ------------------ | ------------------------------------------------------------------------------------------------- | -------- | ------------------ | --------------------------- |
| x-appwrite-user-id | User ID from Appwrite.                                                                            | Header   | String             | 642...7cd                   |
| Content-Type       | The content type of the request body                                                              | Header   | `application/json` | N/A                         |
| successUrl         | The URL to return to after checkout. Defaults to the function domain.                             | Body     | String             | https://example.com/success |
| verifyUrl          | Where the provider returns the user to verify the purchase. Defaults to `/success` on the `successUrl` origin. | Body | String | https://<function-domain>/success |
| failureUrl         | The URL to redirect to after a cancelled or failed checkout. Defaults to the function domain.     | Body     | String             | https://example.com/failure |
| email              | Optional. Prefills the customer's email address in the checkout. Test mode sends real emails too. | Body     | String             | jane@example.com            |
| name               | Optional. Prefills the customer's name in the checkout when `email` is also set.                  | Body     | String             | Jane Doe                    |

**Response**

Sample `303` Response:

The response is a redirect to the Dodo Payments checkout URL, or to the failure URL if an error occurs.

```text
Location: https://test.checkout.dodopayments.com/session/cks_Gi6KGJ2zFJo9rq9Ukifwa
```

```text
Location: https://example.com/failure
```

### `GET /success`

Dodo Payments redirects the user here after checkout. Dodo Payments adds `subscription_id` to the redirect URL, and this endpoint fetches the subscription from Dodo Payments with it. It provisions the user the same way the webhook does, then redirects to the `successUrl` given to the checkout endpoint.

The webhook and this endpoint both provision the user, so either one works if the other fails. Running twice is safe: each run applies the latest status from the provider, and adding or removing a label that is already set or unset does nothing.

### `POST /webhook`

This endpoint receives Dodo Payments webhooks and handles every `subscription.*` event. It verifies the [Standard Webhooks](https://www.standardwebhooks.com/) signature in the `webhook-id`, `webhook-signature` and `webhook-timestamp` headers. If the verification fails, a `401` response is sent. The webhook payload isn't trusted: the function fetches the subscription from Dodo Payments and adds or removes the `subscriber` label based on its current status.

Webhooks can arrive late, twice or out of order, but each one carries the subscription's current status. The function decides from that status rather than the event type, so a delayed event can't give access back after a cancellation:

| Subscription status                                              | Effect                                       |
| ---------------------------------------------------------------- | -------------------------------------------- |
| `active`, `past_due`                                             | Adds the `subscriber` label to the user      |
| `on_hold`, `paused`, `cancelled`, `expired`, `failed`, `pending` | Removes the `subscriber` label from the user |

`past_due` is the grace period while Dodo Payments retries a failed renewal, so the customer keeps access until the subscription moves to `on_hold` or `cancelled`. See the [subscription integration guide](https://docs.dodopayments.com/developer-resources/subscription-integration-guide) for the full lifecycle.

**Parameters**

| Name              | Description                         | Location | Type   | Sample Value                                                                         |
| ----------------- | ----------------------------------- | -------- | ------ | ------------------------------------------------------------------------------------ |
| None              | Webhook payload from Dodo Payments. | Body     | Object | [See Dodo Payments docs](https://docs.dodopayments.com/developer-resources/webhooks) |
| webhook-id        | Unique ID of the webhook message.   | Header   | String | `msg_2Lh9...`                                                                        |
| webhook-signature | Signature from Dodo Payments.       | Header   | String | [See Dodo Payments docs](https://docs.dodopayments.com/developer-resources/webhooks) |
| webhook-timestamp | Unix timestamp of the delivery.     | Header   | String | `1759938600`                                                                         |

**Response**

Sample `200` Response:

In case of a `subscription.*` event, the `subscriber` label is added to or removed from the user. Other events are acknowledged and ignored.

```json
{ "success": true }
```

Sample `401` Response:

```json
{ "success": false }
```

## ⚙️ Configuration

| Setting           | Value                       |
| ----------------- | --------------------------- |
| Runtime           | Node (22)                   |
| Entrypoint        | `src/main.js`               |
| Build Commands    | `npm install`               |
| Permissions       | `any`                       |
| Timeout (Seconds) | 15                          |
| Scopes            | `users.read`, `users.write` |

> If using a demo web app to subscribe, make sure to add your function domain as a web platform to your Appwrite project. Doing this fixes CORS errors and allows proper functionality.

> After deploying, add `https://<function-domain>/webhook` as an endpoint in the Dodo Payments dashboard under **Developer > Webhooks** and select the subscription events. An endpoint with no events selected receives every event type. Copy the endpoint's signing secret into `DODO_PAYMENTS_WEBHOOK_KEY`.

## 🔒 Environment Variables

### DODO_PAYMENTS_API_KEY

API key for sending requests to the Dodo Payments API. The key needs write access to create checkout sessions.

| Question      | Answer                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                |
| Sample Value  | `abcd...`                                                                                          |
| Documentation | [Dodo Payments: API keys](https://docs.dodopayments.com/api-reference/introduction#authentication) |

### DODO_PAYMENTS_WEBHOOK_KEY

Signing secret of the webhook endpoint, used to verify that webhooks come from Dodo Payments.

| Question      | Answer                                                                                |
| ------------- | ------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                   |
| Sample Value  | `whsec_MfKQ...`                                                                       |
| Documentation | [Dodo Payments: Webhooks](https://docs.dodopayments.com/developer-resources/webhooks) |

### DODO_PAYMENTS_PRODUCT_ID

ID of the subscription product to sell.

| Question      | Answer                                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                              |
| Sample Value  | `pdt_0NWa...`                                                                                                    |
| Documentation | [Dodo Payments: Subscriptions](https://docs.dodopayments.com/developer-resources/subscription-integration-guide) |

### DODO_PAYMENTS_ENVIRONMENT

Dodo Payments environment to use, either `test_mode` or `live_mode`. Defaults to `test_mode`. Test mode and live mode have separate API keys, products and webhooks.

| Question      | Answer                                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| Required      | No                                                                                                          |
| Sample Value  | `test_mode`                                                                                                 |
| Documentation | [Dodo Payments: Test mode vs live mode](https://docs.dodopayments.com/miscellaneous/test-mode-vs-live-mode) |
