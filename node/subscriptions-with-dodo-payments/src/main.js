import AppwriteService from './appwrite.js';
import { getStaticFile, interpolate, throwIfMissing } from './utils.js';
import DodoPaymentsService from './dodopayments.js';

// past_due is the grace period while Dodo Payments retries a failed renewal,
// so the customer keeps access. Every other status removes it.
const StatusesWithAccess = ['active', 'past_due'];

export default async (context) => {
  const { req, res, log, error } = context;

  throwIfMissing(process.env, [
    'DODO_PAYMENTS_API_KEY',
    'DODO_PAYMENTS_WEBHOOK_KEY',
    'DODO_PAYMENTS_PRODUCT_ID',
  ]);

  const appwrite = new AppwriteService(req.headers['x-appwrite-key']);
  const dodopayments = new DodoPaymentsService();

  /**
   * Gives or removes the subscriber label based on the subscription's current
   * status in Dodo Payments. Both the webhook and the /success redirect call
   * this. They can run at the same time or out of order, but each one applies
   * the latest status from Dodo Payments and the label updates are
   * idempotent, so they always settle on the same result.
   * @param {string} subscriptionId
   */
  async function syncSubscription(subscriptionId) {
    const subscription = await dodopayments.getSubscription(subscriptionId);
    const subscriptionUserId = subscription.metadata?.user_id;

    if (!subscriptionUserId) {
      error(`Subscription ${subscriptionId} has no user_id in its metadata.`);
      return subscription;
    }

    if (StatusesWithAccess.includes(subscription.status)) {
      await appwrite.createSubscription(subscriptionUserId);
      log(
        `Subscription ${subscriptionId} is ${subscription.status}, user ${subscriptionUserId} has the subscriber label.`
      );
    } else {
      await appwrite.deleteSubscription(subscriptionUserId);
      log(
        `Subscription ${subscriptionId} is ${subscription.status}, user ${subscriptionUserId} doesn't have the subscriber label.`
      );
    }
    return subscription;
  }

  if (req.method === 'GET' && req.path === '/success') {
    let successUrl = '/';

    try {
      // A cancelled or failed checkout can come back without a subscription ID.
      if (req.query.subscription_id) {
        const subscription = await syncSubscription(
          req.query.subscription_id
        );
        successUrl = subscription.metadata?.success_url || successUrl;
      }
    } catch (err) {
      // The webhook still provisions the user, so send them on regardless.
      error(err);
    }

    return res.redirect(successUrl, 303);
  }

  if (req.method === 'GET') {
    const html = interpolate(getStaticFile('index.html'), {
      APPWRITE_FUNCTION_API_ENDPOINT:
        process.env.APPWRITE_FUNCTION_API_ENDPOINT,
      APPWRITE_FUNCTION_PROJECT_ID: process.env.APPWRITE_FUNCTION_PROJECT_ID,
      APPWRITE_FUNCTION_ID: process.env.APPWRITE_FUNCTION_ID,
    });

    return res.text(html, 200, { 'Content-Type': 'text/html; charset=utf-8' });
  }

  switch (req.path) {
    case '/subscribe':
      const body = req.bodyJson;
      const fallbackUrl = req.scheme + '://' + req.headers['host'] + '/';
      const successUrl = body.successUrl ?? fallbackUrl;
      const failureUrl = body.failureUrl ?? fallbackUrl;

      // Dodo Payments returns the user to this function first, which verifies
      // the subscription and then redirects to successUrl.
      const verifyUrl =
        body.verifyUrl ?? new URL('/success', successUrl).toString();

      const userId = req.headers['x-appwrite-user-id'];

      if (!userId) {
        error('User ID not found in request.');
        return res.redirect(failureUrl, 303);
      }

      const checkout = await dodopayments.createSubscription(
        context,
        userId,
        body.email,
        body.name,
        verifyUrl,
        successUrl,
        failureUrl
      );
      if (!checkout?.checkout_url) {
        error('Failed to create Dodo Payments checkout.');
        return res.redirect(failureUrl, 303);
      }

      log(
        `Created Dodo Payments checkout ${checkout.session_id} for user ${userId}.`
      );
      return res.redirect(checkout.checkout_url, 303);

    case '/webhook':
      const event = dodopayments.validateWebhook(context);
      if (!event) {
        return res.json({ success: false }, 401);
      }

      if (!event.type.startsWith('subscription.')) {
        log(`Ignored Dodo Payments event ${event.type}.`);
        return res.json({ success: true });
      }

      // Events can arrive late or out of order, so look the subscription up
      // and apply its current status instead of trusting the event payload.
      await syncSubscription(event.data.subscription_id);
      return res.json({ success: true });

    default:
      return res.text('Not Found', 404);
  }
};
