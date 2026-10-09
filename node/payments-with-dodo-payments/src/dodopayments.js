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
    verifyUrl,
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
          success_url: successUrl,
        },
        // Dodo Payments returns the user to this function first, with the
        // payment ID in the query string. It verifies the payment and then
        // redirects to success_url.
        return_url: verifyUrl,
        cancel_url: failureUrl,
      });
    } catch (err) {
      context.error(err);
      return null;
    }
  }

  /**
   * Fetches a payment from Dodo Payments, so neither the webhook payload nor
   * the redirect query string has to be trusted
   * @param {string} paymentId
   */
  async getPayment(paymentId) {
    return await this.client.payments.retrieve(paymentId);
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
