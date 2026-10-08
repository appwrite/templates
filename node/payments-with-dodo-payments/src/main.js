import AppwriteService from './appwrite.js';
import { getStaticFile, interpolate, throwIfMissing } from './utils.js';
import DodoPaymentsService from './dodopayments.js';

export default async (context) => {
  const { req, res, log, error } = context;

  throwIfMissing(process.env, [
    'DODO_PAYMENTS_API_KEY',
    'DODO_PAYMENTS_WEBHOOK_KEY',
    'DODO_PAYMENTS_PRODUCT_ID',
  ]);

  const databaseId = process.env.APPWRITE_DATABASE_ID || 'orders';
  const tableId = process.env.APPWRITE_TABLE_ID || 'orders';

  if (req.method === 'GET') {
    const html = interpolate(getStaticFile('index.html'), {
      APPWRITE_FUNCTION_API_ENDPOINT:
        process.env.APPWRITE_FUNCTION_API_ENDPOINT,
      APPWRITE_FUNCTION_PROJECT_ID: process.env.APPWRITE_FUNCTION_PROJECT_ID,
      APPWRITE_FUNCTION_ID: process.env.APPWRITE_FUNCTION_ID,
      APPWRITE_DATABASE_ID: databaseId,
      APPWRITE_TABLE_ID: tableId,
    });

    return res.text(html, 200, { 'Content-Type': 'text/html; charset=utf-8' });
  }

  const appwrite = new AppwriteService(req.headers['x-appwrite-key']);
  const dodopayments = new DodoPaymentsService();

  switch (req.path) {
    case '/checkout':
      const body = req.bodyJson;
      const fallbackUrl = req.scheme + '://' + req.headers['host'] + '/';
      const successUrl = body.successUrl ?? fallbackUrl;
      const failureUrl = body.failureUrl ?? fallbackUrl;

      const userId = req.headers['x-appwrite-user-id'];

      if (!userId) {
        error('User ID not found in request.');
        return res.redirect(failureUrl, 303);
      }

      const checkout = await dodopayments.createCheckout(
        context,
        userId,
        body.email,
        body.name,
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

      if (event.type !== 'payment.succeeded') {
        log(`Ignored Dodo Payments event ${event.type}.`);
        return res.json({ success: true });
      }

      const payment = event.data;
      const orderUserId = payment.metadata?.user_id;
      const orderId = payment.payment_id;

      // Dodo Payments retries any non-2xx response, and a payment without a
      // user ID will never succeed, so acknowledge it instead.
      if (!orderUserId) {
        error(`Payment ${orderId} has no user_id in its metadata.`);
        return res.json({ success: true });
      }

      await appwrite.setup(databaseId, tableId);

      const created = await appwrite.createOrder(
        databaseId,
        tableId,
        orderUserId,
        orderId
      );
      if (!created) {
        log(`Order ${orderId} was already stored.`);
        return res.json({ success: true });
      }

      log(
        `Created order row for user ${orderUserId} with Dodo Payments payment ID ${orderId}.`
      );
      return res.json({ success: true });

    default:
      return res.text('Not Found', 404);
  }
};
