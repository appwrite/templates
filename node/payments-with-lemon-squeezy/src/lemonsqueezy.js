import {
  lemonSqueezySetup,
  createCheckout,
} from '@lemonsqueezy/lemonsqueezy.js';
import crypto from 'crypto';

class LemonSqueezyService {
  constructor() {
    this.client = lemonSqueezySetup({
      apiKey: process.env.LEMON_SQUEEZY_API_KEY,
    });
  }

  async createCheckout(context, userId, userEmail, userName) {
    try {
      const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
      const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID;
      const newCheckout = {
        productOptions: {
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
