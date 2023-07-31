/// <reference types="stripe-event-types" />

import stripe from 'stripe';

class StripeService {
  constructor(env) {
    // Note: stripe cjs API types are faulty
    /** @type {import('stripe').Stripe} */
    // @ts-ignore
    this.client = stripe(env.STRIPE_SECRET_KEY);
  }

  /**
   * @param {string} userId
   */
  async checkoutSubscription(userId) {
    /** @type {import('stripe').Stripe.Checkout.SessionCreateParams.LineItem} */
    const lineItem = {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Premium Subscription',
        },
        unit_amount: 1000,
        recurring: {
          interval: 'year',
        },
      },
      quantity: 1,
    };

    try {
      return await this.client.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [lineItem],
        success_url: process.env.SUCCESS_URL,
        cancel_url: process.env.CANCEL_URL,
        client_reference_id: userId,
        metadata: {
          userId,
        },
        mode: 'subscription',
      });
    } catch (err) {
      return null;
    }
  }

  /**
   * @returns {import("stripe").Stripe.DiscriminatedEvent | null}
   */
  validateWebhook(req) {
    try {
      const event = this.client.webhooks.constructEvent(
        req.body,
        req.headers['stripe-signature'],
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return /** @type {import("stripe").Stripe.DiscriminatedEvent} */ (event);
    } catch (err) {
      return null;
    }
  }
}

export default StripeService;
