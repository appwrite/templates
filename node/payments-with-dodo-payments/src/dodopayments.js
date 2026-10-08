import DodoPayments from 'dodopayments';

class DodoPaymentsService {
  constructor() {
    this.client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
      // The SDK defaults to live mode, so fall back to test mode explicitly.
      environment: process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode',
    });
  }

  async createCheckout(
    context,
    userId,
    userEmail,
    userName,
    successUrl,
    failureUrl
  ) {
    try {
      return await this.client.checkoutSessions.create({
        product_cart: [
          { product_id: process.env.DODO_PAYMENTS_PRODUCT_ID, quantity: 1 },
        ],
        // Test mode sends real emails, so only prefill an address the user entered.
        customer: userEmail ? { email: userEmail, name: userName } : undefined,
        metadata: {
          user_id: userId,
        },
        return_url: successUrl,
        cancel_url: failureUrl,
      });
    } catch (err) {
      context.error(err);
      return null;
    }
  }

  /**
   * Verifies the Standard Webhooks signature of a Dodo Payments webhook
   * @param {*} context
   * @returns {*} The verified event, or null if verification failed
   */
  validateWebhook(context) {
    try {
      const { headers } = context.req;
      // unwrap() only verifies the signature when headers are passed.
      const event = this.client.webhooks.unwrap(context.req.bodyText, {
        headers: {
          'webhook-id': headers['webhook-id'],
          'webhook-signature': headers['webhook-signature'],
          'webhook-timestamp': headers['webhook-timestamp'],
        },
      });

      context.log('Webhook signature is valid.');
      return event;
    } catch (err) {
      context.error(err);
      return null;
    }
  }
}

export default DodoPaymentsService;
