import StripeService from './stripe.js';
import AppwriteService from './appwrite.js';
import { getStaticFile, interpolate, throwIfMissing } from './utils.js';

export default async ({ req, res, log, error }) => {
  throwIfMissing(process.env, [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'APPWRITE_API_KEY'
  ]);

  if (req.method === 'GET') {
    const html = interpolate(getStaticFile('index.html'), {
      APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1',
      APPWRITE_FUNCTION_PROJECT_ID: process.env.APPWRITE_FUNCTION_PROJECT_ID,
      APPWRITE_FUNCTION_ID: process.env.APPWRITE_FUNCTION_ID
    });

    return res.send(html, 200, { 'Content-Type': 'text/html; charset=utf-8' });
  }

  const appwrite = new AppwriteService();
  const stripe = new StripeService();

  switch (req.path) {
    case '/subscribe':
      const userId = req.headers['x-appwrite-user-id'];
      if (!userId) {
        error('User ID not found in request.');
        return res.redirect(process.env.FAILURE_URL ?? '/', 303);
      }

      const session = await stripe.checkoutSubscription(context, userId);
      if (!session) {
        error('Failed to create Stripe checkout session.');
        return res.redirect(process.env.FAILURE_URL ?? '/', 303);
      }

      log(`Created Stripe checkout session for user ${userId}.`);
      return res.redirect(session.url, 303);

    case '/webhook':
      const event = stripe.validateWebhook(context, req);
      if (!event) {
        return res.json({ success: false }, 401);
      }

      if (event.type === 'customer.subscription.created') {
        const session = event.data.object;
        const userId = session.metadata.userId;

        await appwrite.createSubscription(userId);
        log(`Created subscription for user ${userId}`);
        return res.json({ success: true });
      }

      if (event.type === 'customer.subscription.deleted') {
        const session = event.data.object;
        const userId = session.metadata.userId;

        await appwrite.deleteSubscription(userId);
        log(`Deleted subscription for user ${userId}`);
        return res.json({ success: true });
      }

      return res.json({ success: true });

    default:
      return res.send('Not Found', 404);
  }
};
