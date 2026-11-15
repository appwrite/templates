import StripeService from './stripe.js';
import AppwriteService from './appwrite.js';
import { getStaticFile, interpolate, throwIfMissing } from './utils.js';

// past_due is the grace period while Stripe retries a failed renewal, so the
// customer keeps access. Every other status removes it.
const StatusesWithAccess = ['active', 'trialing', 'past_due'];

export default async (context) => {
  const { req, res, log, error } = context;

  throwIfMissing(process.env, [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ]);

  const appwrite = new AppwriteService(context.req.headers['x-appwrite-key']);
  const stripe = new StripeService();

  /**
   * Gives or removes the subscriber label based on the subscription's current
   * status in Stripe. Both the webhook and the /success redirect call this.
   * They can run at the same time or out of order, but each one applies the
   * latest status from Stripe and the label updates are idempotent, so they
   * always settle on the same result.
   * @param {string} subscriptionId
   */
  async function syncSubscription(subscriptionId) {
    const subscription = await stripe.getSubscription(subscriptionId);
    const userId = subscription.metadata?.userId;

    if (!userId) {
      error(`Subscription ${subscription.id} has no userId in its metadata.`);
      return;
    }

    if (StatusesWithAccess.includes(subscription.status)) {
      await appwrite.createSubscription(userId);
      log(
        `Subscription ${subscription.id} is ${subscription.status}, user ${userId} has the subscriber label.`
      );
    } else {
      await appwrite.deleteSubscription(userId);
      log(
        `Subscription ${subscription.id} is ${subscription.status}, user ${userId} doesn't have the subscriber label.`
      );
    }
  }

  if (req.method === 'GET' && req.path === '/success') {
    const sessionId = req.query.session_id;
    let successUrl = '/';

    try {
      const session = await stripe.getCheckoutSession(sessionId);
      successUrl = session.metadata?.successUrl || successUrl;

      if (session.subscription) {
        await syncSubscription(/** @type {string} */ (session.subscription));
      }
    } catch (err) {
      // The webhook still provisions the user, so send them on regardless.
      error(err);
    }

    return res.redirect(successUrl, 303);
  }

  if (req.method === 'GET') {
    const html = interpolate(getStaticFile('index.html'), {
      APPWRITE_FUNCTION_API_ENDPOINT: process.env.APPWRITE_FUNCTION_API_ENDPOINT,
      APPWRITE_FUNCTION_PROJECT_ID: process.env.APPWRITE_FUNCTION_PROJECT_ID,
      APPWRITE_FUNCTION_ID: process.env.APPWRITE_FUNCTION_ID,
    });

    return res.text(html, 200, { 'Content-Type': 'text/html; charset=utf-8' });
  }

  switch (req.path) {
    case '/subscribe':
      const fallbackUrl = req.scheme + '://' + req.headers['host'] + '/';

      const successUrl = req.body?.successUrl ?? fallbackUrl;
      const failureUrl = req.body?.failureUrl ?? fallbackUrl;
      // Stripe returns the user to this function first, which verifies the
      // subscription and then redirects to successUrl.
      const verifyUrl =
        req.body?.verifyUrl ?? new URL('/success', successUrl).toString();

      const userId = req.headers['x-appwrite-user-id'];
      if (!userId) {
        error('User ID not found in request.');
        return res.redirect(failureUrl, 303);
      }

      const session = await stripe.checkoutSubscription(
        context,
        userId,
        verifyUrl,
        successUrl,
        failureUrl
      );
      if (!session) {
        error('Failed to create Stripe checkout session.');
        return res.redirect(failureUrl, 303);
      }

      context.log('Session:');
      context.log(session);

      log(`Created Stripe checkout session for user ${userId}.`);
      return res.redirect(session.url, 303);

    case '/webhook':
      const event = stripe.validateWebhook(context, req);
      if (!event) {
        return res.json({ success: false }, 401);
      }

      context.log('Event:');
      context.log(event);

      if (
        event.type === 'customer.subscription.created' ||
        event.type === 'customer.subscription.updated' ||
        event.type === 'customer.subscription.deleted'
      ) {
        await syncSubscription(event.data.object.id);
      }

      return res.json({ success: true });

    default:
      return res.text('Not Found', 404);
  }
};
