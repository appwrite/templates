# Stripe Subscriptions Function

This function helps to handle Stripe subscriptions and track them in an Appwrite database. It consists of handling Stripe checkout sessions, webhooks, and managing user subscriptions in a database.

## Setup

### Stripe API

Setting up the Stripe API involves generating the required API keys and setting up the necessary webhook.

1. **API Keys**
    - Log in to your Stripe dashboard.
    - Navigate to Developers > API keys.
    - Here, you can find your publishable key and your secret key. You will need the secret key for this function (i.e., `STRIPE_SECRET_KEY`). Be sure not to share or expose this key as it could allow others to make API requests on behalf of your account.

2. **Webhooks**
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

To setup the database, run `npm run setup`. 
If the specified database doesn't exist, the script will automatically create it. It will also create a collection within the database, adding the necessary attributes to the collection.

## Usage

This function supports two primary request paths:

1. **Checkout Session Creation**

   - **Request Path:** /checkout
   - **Request Type:** GET
   - **Response:** 
     - On success, the function will redirect to the Stripe Checkout session URL.
     - If the request fails, the user is redirected to the specified `CANCEL_URL`.

2. **Webhook Handling**

   - **Request Path:** /webhook
   - **Request Type:** POST
   - **Content Type:** application/json
   - **Response:** 
     - The function will respond with an empty response after processing the webhook events.
     - It handles two events:
        1. `customer.subscription.created` - The user is upgraded to a premium subscription.
        2. `customer.subscription.deleted` - The user is downgraded from their premium subscription.

