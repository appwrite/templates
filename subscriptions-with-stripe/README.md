# Stripe Subscriptions Function

Integrates Stripe subscriptions into your Appwrite project. Collect payments using the `/checkout` endpoint and check the status of a user subscription using the `Subscriptions` collection.

## Setup
### Stripe API

**Stripe Key**
  - Log in to your Stripe dashboard.
  - Navigate to Developers > API keys.
  - Here, you can find your publishable key and your secret key. You will need the secret key for this function (i.e., `STRIPE_SECRET_KEY`). Be sure not to share or expose this key as it could allow others to make API requests on behalf of your account.

**Stripe Webhook Secret**
  - In your Stripe dashboard, navigate to Developers > Webhooks.
   - Click "+ Add endpoint" and set the URL to where you've hosted this function with the /webhook path, and select the "customer.subscription.created" and "customer.subscription.deleted" events.
  - Once you've created the webhook, you'll be able to view and copy the signing secret (i.e., `STRIPE_WEBHOOK_SECRET`).

### Environment Variables

To ensure the function operates as intended, ensure the following variables are set:

- **APPWRITE_API_KEY**: This is your Appwrite project's API key.
- **APPWRITE_ENDPOINT**: This is the endpoint where your Appwrite server is located.
- **APPWRITE_PROJECT_ID**: This refers to the specific ID of your Appwrite project.
- **STRIPE_SECRET_KEY**: This is your Stripe Secret key.
- **STRIPE_WEBHOOK_SECRET**: The secret used to validate the Stripe Webhook signature.
- **SUCCESS_URL**: The URL users are redirected to after a successful payment.
- **CANCEL_URL**: The URL users are redirected to after a cancelled payment attempt.

Additionally, the function has the following optional variables:

- **DATABASE_ID**: This is the ID for the database where subscriptions will be stored. If not provided, it defaults to "stripe-subscriptions".
- **COLLECTION_ID**: This is the ID for the collection within the database. If not provided, it defaults to "subscriptions".

### Database Setup

A setup script is included in `src/setup.js`. If the `Subscriptions` database doesn't exist, the setup script will automatically create it. It will also create a collection within the database, adding the necessary attributes to the collection. The setup script will run automatically when the function is deployed.

## Function API

- `GET /checkout` - Creates a Stripe Checkout session and redirects the user to the Stripe Checkout page. If the user successfully completes the payment, they are redirected to the `SUCCESS_URL`. If the user cancels the payment, they are redirected to the `CANCEL_URL`.

- `POST /webhook` - Handles Stripe webhook events. This function handles two events:
`customer.subscription.created` and `customer.subscription.deleted` - The function validates the webhook event and upgrades or downgrades the user's subscription in the database based on the event type.


## Advanced Usage

The checkout page may be customised by editing `src/stripe.js` to include your desired product data, prices, and styling.

