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
   * this, and the label updates are idempotent, so running twice is safe.
   * @param {string} subscriptionId
   * @param {{ grantOnly?: boolean }} [options] With grantOnly, a status without
   * access leaves the label as it is instead of removing it.
   */
  async function syncSubscription(subscriptionId, { grantOnly = false } = {}) {
    const subscription = await dodopayments.getSubscription(subscriptionId);
    const subscriptionUserId = subscription.metadata?.user_id;

    if (!subscriptionUserId) {
      error(`Subscription ${subscriptionId} has no user_id in its metadata.`);
      return subscription;
    }

    const hasAccess = StatusesWithAccess.includes(subscription.status);
    if (!hasAccess && grantOnly) {
      log(
        `Subscription ${subscriptionId} is ${subscription.status}, leaving the subscriber label to the webhook.`
      );
      return subscription;
    }
    if (!(await setSubscriberLabel(subscriptionUserId, hasAccess))) {
      return subscription;
    }
    log(
      `Subscription ${subscriptionId} is ${subscription.status}, user ${subscriptionUserId} ${hasAccess ? 'has' : "doesn't have"} the subscriber label.`
    );

    // Another run can apply a newer status between this run's lookup and its
    // label update, which this run would then overwrite. Looking the
    // subscription up again after the update catches that, and the newer
    // status wins.
    const latest = await dodopayments.getSubscription(subscriptionId);
    const latestHasAccess = StatusesWithAccess.includes(latest.status);
    if (latestHasAccess !== hasAccess) {
      await setSubscriberLabel(subscriptionUserId, latestHasAccess);
      log(
        `Subscription ${subscriptionId} changed to ${latest.status} during the update, user ${subscriptionUserId} ${latestHasAccess ? 'has' : "doesn't have"} the subscriber label.`
      );
    }
    return latest;
  }

  /**
   * @param {string} userId
   * @param {boolean} hasAccess
   * @returns {Promise<boolean>} false if the user no longer exists
   */
  async function setSubscriberLabel(userId, hasAccess) {
    try {
      if (hasAccess) {
        await appwrite.createSubscription(userId);
      } else {
        await appwrite.deleteSubscription(userId);
      }
      return true;
    } catch (err) {
      // Dodo Payments retries any non-2xx response, and a deleted user will
      // never come back, so acknowledge the event instead.
      if (err.code !== 404) throw err;
      error(`User ${userId} no longer exists.`);
      return false;
    }
  }

  if (req.method === 'GET' && req.path === '/success') {
    let successUrl = '/';

    try {
      // A cancelled or failed checkout can come back without a subscription ID.
      if (req.query.subscription_id) {
        // The redirect can arrive while the subscription is still pending, so
        // this only gives the label and leaves removing it to the webhook.
        const subscription = await syncSubscription(req.query.subscription_id, {
          grantOnly: true,
        });
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

      // verifyUrl is this function's /success route, which verifies the
      // subscription and then redirects to successUrl. Called through the
      // Appwrite API, the function can't tell its own domain, so the caller
      // passes it. Without it, the user returns straight to successUrl and the
      // webhook gives the label.
      const returnUrl = body.verifyUrl ?? successUrl;

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
        returnUrl,
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
