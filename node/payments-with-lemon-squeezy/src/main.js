import AppwriteService from './appwrite.js';
import { getStaticFile, interpolate, throwIfMissing } from './utils.js';
import LemonSqueezyService from './lemonsqueezy.js';

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
   * Stores the order if it's paid. Both the webhook and the /success redirect
   * call this, so the order is stored even if one of them never arrives.
   * @param {*} order Order fetched from the Lemon Squeezy API
   * @param {string} userId
   */
  async function fulfillOrder(order, userId) {
    if (order.attributes.status !== 'paid') {
      log(`Order ${order.id} is ${order.attributes.status}, not fulfilling.`);
      return;
    }

    await appwrite.setup();

    const created = await appwrite.createOrder(
      databaseId,
      collectionId,
      userId,
      String(order.id)
    );
    log(
      created
        ? `Created order document for user ${userId} with Lemon Squeezy order ID ${order.id}`
        : `Order ${order.id} was already stored.`
    );
  }

  if (req.method === 'GET' && req.path === '/success') {
    const state = lemonsqueezy.verifyState(req.query.state);
    if (!state) {
      error('Invalid redirect state.');
      return res.redirect('/', 303);
    }

    try {
      // Without an email the user entered, the order can't be matched to them
      // here, so it's left to the webhook.
      if (state.email) {
        const orders = await lemonsqueezy.findPaidOrders(
          state.email,
          state.createdAt
        );
        for (const order of orders) {
          await fulfillOrder(order, state.userId);
        }
      }
    } catch (err) {
      // The webhook still fulfills the order, so send the user on regardless.
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
    case '/checkout':
      const fallbackUrl = req.scheme + '://' + req.headers['host'] + '/';
      const successUrl = req.body?.successUrl ?? fallbackUrl;
      const failureUrl = req.body?.failureUrl ?? fallbackUrl;
      // Lemon Squeezy returns the user to this function first, which verifies
      // the order and then redirects to successUrl.
      const verifyUrl =
        req.body?.verifyUrl ?? new URL('/success', successUrl).toString();

      const userId = req.headers['x-appwrite-user-id'];
      let userEmail = req.body?.email;
      let userName = req.body?.name;

      if (!userId) {
        error('User ID not found in request.');
        return res.redirect(failureUrl, 303);
      }

      const checkout = await lemonsqueezy.createCheckout(
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
      if (eventType !== 'order_created') {
        log(`Ignored Lemon Squeezy event ${eventType}.`);
        return res.json({ success: true });
      }

      const orderUserId = req.body.meta.custom_data?.user_id;
      if (!orderUserId) {
        error(`Order ${req.body.data.id} has no user_id in its custom data.`);
        return res.json({ success: true });
      }

      // Look the order up instead of trusting the event payload.
      const order = await lemonsqueezy.getOrder(req.body.data.id);
      await fulfillOrder(order, orderUserId);

      return res.json({ success: true });

    default:
      return res.text('Not Found', 404);
  }
};
