/// <reference types="stripe-event-types" />

import stripe from 'stripe';

class StripeService {
  constructor() {
    // Note: stripe cjs API types are faulty
    /** @type {import('stripe').Stripe} */
    // @ts-ignore
    this.client = stripe(process.env.STRIPE_SECRET_KEY);
  }

  /**
   * @param {string} userId
   * @param {string} verifyUrl The function's /success route
   * @param {string} successUrl
   * @param {string} failureUrl
   */
  async checkoutPayment(context, userId, verifyUrl, successUrl, failureUrl) {
    /** @type {import('stripe').Stripe.Checkout.SessionCreateParams.LineItem} */
    const lineItem = {
      price_data: {
        unit_amount: 1000, // $10.00
        currency: 'usd',
        product_data: {
          name: 'Product',
        },
      },
      quantity: 1,
    };

    try {
      return await this.client.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [lineItem],
        // Stripe fills in {CHECKOUT_SESSION_ID}, so /success knows which
        // session to verify before sending the user on to successUrl.
        success_url: `${verifyUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: failureUrl,
        client_reference_id: userId,
        metadata: {
          userId,
          successUrl,
        },
        mode: 'payment',
      });
    } catch (err) {
      context.error(err);
      return null;
    }
  }

  /**
   * Fetches a checkout session from Stripe, so neither the webhook payload
   * nor the redirect query string has to be trusted
   * @param {string} sessionId
   * @returns {Promise<import('stripe').Stripe.Checkout.Session>}
   */
  async getCheckoutSession(sessionId) {
    return await this.client.checkout.sessions.retrieve(sessionId);
  }

  /**
   * @returns {import("stripe").Stripe.DiscriminatedEvent | null}
   */
  validateWebhook(context, req) {
    try {
      const event = this.client.webhooks.constructEvent(
        req.bodyBinary,
        req.headers['stripe-signature'],
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return /** @type {import("stripe").Stripe.DiscriminatedEvent} */ (event);
    } catch (err) {
      context.error(err);
      return null;
    }
  }
}

export default StripeService;
