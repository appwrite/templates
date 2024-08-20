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

  const appwrite = new AppwriteService(context.req.headers['x-appwrite-key']);
  const lemonsqueezy = new LemonSqueezyService();

  switch (req.path) {
    case '/checkout':
      const fallbackUrl = req.scheme + '://' + req.headers['host'] + '/';
      const failureUrl = req.body?.failureUrl ?? fallbackUrl;

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
        userName
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

      const order = req.body;

      log(order);

      const orderUserId = order.meta.custom_data.user_id;
      const orderId = order.data.id;

      await appwrite.createOrder(
        databaseId,
        collectionId,
        orderUserId,
        orderId
      );
      log(
        `Created order document for user ${orderUserId} with Lemon Squeezy order ID ${orderId}`
      );

      return res.json({ success: true });

    default:
      return res.text('Not Found', 404);
  }
};
