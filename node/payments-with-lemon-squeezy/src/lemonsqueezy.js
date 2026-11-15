import {
  lemonSqueezySetup,
  createCheckout,
  getOrder,
  listOrders,
} from '@lemonsqueezy/lemonsqueezy.js';
import crypto from 'crypto';

class LemonSqueezyService {
  constructor() {
    this.client = lemonSqueezySetup({
      apiKey: process.env.LEMON_SQUEEZY_API_KEY,
    });
  }

  async createCheckout(context, userId, userEmail, userName, verifyUrl, successUrl) {
    try {
      const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
      const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID;
      const newCheckout = {
        productOptions: {
          // Lemon Squeezy returns the user to this function first, which
          // verifies the purchase and then redirects to successUrl.
          redirectUrl: `${verifyUrl}?state=${this.signState({
            userId,
            // Only an email the user entered identifies their purchase.
            email: userEmail,
            successUrl,
            createdAt: new Date().toISOString(),
          })}`,
          name: 'Test Product',
          description:
            'A product created to test Lemon Squeezy payments in Appwrite Functions.',
        },
        checkoutOptions: {
          embed: true,
          media: true,
          logo: true,
        },
        checkoutData: {
          email: userEmail ?? 'test@user.xyz',
          name: userName ?? 'Test User',
          custom: {
            user_id: userId,
          },
        },
        expiresAt: null,
        preview: true,
        testMode: true,
      };
      return await createCheckout(storeId, variantId, newCheckout);
    } catch (err) {
      context.error(err);
      return null;
    }
  }

  /**
   * Fetches an order from Lemon Squeezy, so the webhook payload doesn't have
   * to be trusted
   * @param {string} orderId
   */
  async getOrder(orderId) {
    const { data, error } = await getOrder(orderId);
    if (error) throw error;
    return data.data;
  }

  /**
   * Finds the paid orders for the configured variant that were placed with
   * the given email after the given time. Lemon Squeezy doesn't send an order
   * ID to the redirect URL, so this is how /success finds the purchase.
   * @param {string} email
   * @param {string} since ISO 8601 timestamp
   */
  async findPaidOrders(email, since) {
    const { data, error } = await listOrders({
      filter: {
        storeId: process.env.LEMON_SQUEEZY_STORE_ID,
        userEmail: email,
      },
    });
    if (error) throw error;

    return data.data.filter(
      (order) =>
        order.attributes.status === 'paid' &&
        String(order.attributes.first_order_item.variant_id) ===
          String(process.env.LEMON_SQUEEZY_VARIANT_ID) &&
        new Date(order.attributes.created_at) >= new Date(since)
    );
  }

  /**
   * Signs the redirect state, so /success can trust the user ID in it
   * @param {Record<string, string | undefined>} state
   * @returns {string}
   */
  signState(state) {
    const payload = Buffer.from(JSON.stringify(state)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', process.env.LEMON_SQUEEZY_WEBHOOK_SECRET)
      .update(payload)
      .digest('base64url');
    return `${payload}.${signature}`;
  }

  /**
   * @param {string} token
   * @returns {Record<string, string | undefined> | null} The state, or null if
   * the signature is invalid
   */
  verifyState(token) {
    const [payload, signature] = String(token ?? '').split('.');
    if (!payload || !signature) return null;

    const expected = Buffer.from(
      crypto
        .createHmac('sha256', process.env.LEMON_SQUEEZY_WEBHOOK_SECRET)
        .update(payload)
        .digest('base64url')
    );
    const actual = Buffer.from(signature);
    if (
      expected.length !== actual.length ||
      !crypto.timingSafeEqual(expected, actual)
    ) {
      return null;
    }

    return JSON.parse(Buffer.from(payload, 'base64url').toString());
  }

  validateWebhook(context) {
    try {
      const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
      const hmac = crypto.createHmac('sha256', secret);
      const digest = Buffer.from(
        hmac.update(context.req.bodyBinary).digest('hex'),
        'utf8'
      );
      const signature = Buffer.from(context.req.headers['x-signature'], 'utf8');

      if (!crypto.timingSafeEqual(digest, signature)) {
        throw new Error('Invalid signature.');
      }

      context.log('Webhook signature is valid.');
      return true;
    } catch (err) {
      context.error(err);
      return false;
    }
  }
}

export default LemonSqueezyService;
