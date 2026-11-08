import AppwriteService from './appwrite.js';
import { getStaticFile, interpolate, throwIfMissing } from './utils.js';
import LemonSqueezyService from './lemonsqueezy.js';

// A cancelled subscription stays usable until the end of the billing period,
// when it becomes expired. past_due is the grace period while Lemon Squeezy
// retries a failed renewal. Every other status removes access.
const StatusesWithAccess = ['on_trial', 'active', 'past_due', 'cancelled'];

const SubscriptionEvents = [
  'subscription_created',
  'subscription_updated',
  'subscription_cancelled',
  'subscription_resumed',
  'subscription_expired',
  'subscription_paused',
  'subscription_unpaused',
];

export default async (context) => {
  const { req, res, log, error } = context;

  throwIfMissing(process.env, [
    'LEMON_SQUEEZY_API_KEY',
    'LEMON_SQUEEZY_WEBHOOK_SECRET',
    'LEMON_SQUEEZY_STORE_ID',
    'LEMON_SQUEEZY_VARIANT_ID',
  ]);

  const databaseId = process.env.APPWRITE_DATABASE_ID ?? 'orders';
  const collectionId = process.env.APPWRITE_COLLECTION_ID ?? 'orders';

  const appwrite = new AppwriteService(context.req.headers['x-appwrite-key']);
  const lemonsqueezy = new LemonSqueezyService();

  /**
   * Gives or removes the subscriber label based on the subscription's current
   * status. Both the webhook and the /success redirect call this. They can
   * run at the same time or out of order, but each one applies the latest
   * status from Lemon Squeezy and the label updates are idempotent, so they
   * always settle on the same result.
   * @param {*} subscription Subscription fetched from the Lemon Squeezy API
   * @param {string} userId
   */
  async function syncSubscription(subscription, userId) {
    const { status } = subscription.attributes;

    if (StatusesWithAccess.includes(status)) {
      await appwrite.createSubscription(userId);
      log(
        `Subscription ${subscription.id} is ${status}, user ${userId} has the subscriber label.`
      );
    } else {
      await appwrite.deleteSubscription(userId);
      log(
        `Subscription ${subscription.id} is ${status}, user ${userId} doesn't have the subscriber label.`
      );
    }
  }

  if (req.method === 'GET' && req.path === '/success') {
    const state = lemonsqueezy.verifyState(req.query.state);
    if (!state) {
      error('Invalid redirect state.');
      return res.redirect('/', 303);
    }

    try {
      // Without an email the user entered, the subscription can't be matched
      // to them here, so it's left to the webhook.
      if (state.email) {
        const subscriptions = await lemonsqueezy.findSubscriptions(
          state.email,
          state.createdAt
        );
        for (const subscription of subscriptions) {
          await syncSubscription(subscription, state.userId);
        }
      }
    } catch (err) {
      // The webhook still provisions the user, so send them on regardless.
      error(err);
    }

    return res.redirect(state.successUrl || '/', 303);
  }

  if (req.method === 'GET') {
    const html = interpolate(getStaticFile('index.html'), {
      APPWRITE_FUNCTION_API_ENDPOINT: process.env.APPWRITE_FUNCTION_API_ENDPOINT,
      APPWRITE_FUNCTION_PROJECT_ID: process.env.APPWRITE_FUNCTION_PROJECT_ID,
      APPWRITE_FUNCTION_ID: process.env.APPWRITE_FUNCTION_ID,
      APPWRITE_DATABASE_ID: databaseId,
      APPWRITE_COLLECTION_ID: collectionId,
    });

    return res.text(html, 200, { 'Content-Type': 'text/html; charset=utf-8' });
  }

  switch (req.path) {
    case '/subscribe':
      const fallbackUrl = req.scheme + '://' + req.headers['host'] + '/';
      const successUrl = req.body?.successUrl ?? fallbackUrl;
      const failureUrl = req.body?.failureUrl ?? fallbackUrl;
      // Lemon Squeezy returns the user to this function first, which verifies
      // the subscription and then redirects to successUrl.
      const verifyUrl =
        req.body?.verifyUrl ?? new URL('/success', successUrl).toString();

      const userId = req.headers['x-appwrite-user-id'];
      let userEmail = req.body?.email;
      let userName = req.body?.name;

      if (!userId) {
        error('User ID not found in request.');
        return res.redirect(failureUrl, 303);
      }

      const checkout = await lemonsqueezy.createSubscription(
        context,
        userId,
        userEmail,
        userName,
        verifyUrl,
        successUrl
      );
      if (!checkout) {
        error('Failed to create Lemon Squeezy checkout.');
        return res.redirect(failureUrl, 303);
      }

      log('Checkout:');
      log(checkout);

      log(`Created Lemon Squeezy checkout for user ${userId}.`);
      return res.redirect(checkout.data.data.attributes.url, 303);

    case '/webhook':
      let validRequest = lemonsqueezy.validateWebhook(context);
      if (!validRequest) {
        return res.json({ success: false }, 401);
      }

      const eventType = req.headers['x-event-name'];
      if (!SubscriptionEvents.includes(eventType)) {
        log(`Ignored Lemon Squeezy event ${eventType}.`);
        return res.json({ success: true });
      }

      const subscriptionUserId = req.body.meta.custom_data?.user_id;
      if (!subscriptionUserId) {
        error(
          `Subscription ${req.body.data.id} has no user_id in its custom data.`
        );
        return res.json({ success: true });
      }

      // Events can arrive late or out of order, so look the subscription up
      // and apply its current status instead of trusting the event payload.
      const subscription = await lemonsqueezy.getSubscription(
        req.body.data.id
      );
      await syncSubscription(subscription, subscriptionUserId);

      return res.json({ success: true });

    default:
      return res.text('Not Found', 404);
  }
};
