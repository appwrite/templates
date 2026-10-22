import StripeService from './stripe.js';
import AppwriteService from './appwrite.js';
import { getStaticFile, interpolate, throwIfMissing } from './utils.js';

export default async (context) => {
  const { req, res, log, error } = context;

  throwIfMissing(process.env, [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ]);

  const databaseId = process.env.APPWRITE_DATABASE_ID ?? 'orders';
  const collectionId = process.env.APPWRITE_COLLECTION_ID ?? 'orders';

  const appwrite = new AppwriteService(context.req.headers['x-appwrite-key']);
  const stripe = new StripeService();

  /**
   * Stores the order if Stripe reports the checkout session as paid. Both the
   * webhook and the /success redirect call this, so the order is stored even
   * if one of them never arrives.
   * @param {string} sessionId
   * @returns {Promise<import('stripe').Stripe.Checkout.Session>}
   */
  async function fulfillCheckout(sessionId) {
    const session = await stripe.getCheckoutSession(sessionId);

    // Delayed payment methods complete the session before the money arrives.
    // checkout.session.async_payment_succeeded fulfills those later.
    if (session.payment_status !== 'paid') {
      log(`Session ${session.id} is ${session.payment_status}, not fulfilling.`);
      return session;
    }

    const userId = session.metadata?.userId;
    if (!userId) {
      error(`Session ${session.id} has no userId in its metadata.`);
      return session;
    }

    const paymentIntentId = /** @type {string} */ (session.payment_intent);
    const created = await appwrite.createOrder(
      databaseId,
      collectionId,
      paymentIntentId,
      userId,
      session.id
    );
    log(
      created
        ? `Created order document for user ${userId} with Stripe order ID ${session.id}`
        : `Order ${session.id} was already stored.`
    );
    return session;
  }

  if (req.method === 'GET' && req.path === '/success') {
    const sessionId = req.query.session_id;
    let successUrl = '/';

    try {
      const session = await fulfillCheckout(sessionId);
      successUrl = session.metadata?.successUrl || successUrl;
    } catch (err) {
      // The webhook still fulfills the order, so send the user on regardless.
      error(err);
    }

    return res.redirect(successUrl, 303);
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
    case '/checkout':
      const fallbackUrl = req.scheme + '://' + req.headers['host'] + '/';

      const successUrl = req.body?.successUrl ?? fallbackUrl;
      const failureUrl = req.body?.failureUrl ?? fallbackUrl;
      // Stripe returns the user to this function first, which verifies the
      // payment and then redirects to successUrl.
      const verifyUrl =
        req.body?.verifyUrl ?? new URL('/success', successUrl).toString();

      const userId = req.headers['x-appwrite-user-id'];
      if (!userId) {
        error('User ID not found in request.');
        return res.redirect(failureUrl, 303);
      }

      const session = await stripe.checkoutPayment(
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
        event.type === 'checkout.session.completed' ||
        event.type === 'checkout.session.async_payment_succeeded'
      ) {
        await fulfillCheckout(event.data.object.id);
      }

      return res.json({ success: true });

    default:
      return res.text('Not Found', 404);
  }
};
