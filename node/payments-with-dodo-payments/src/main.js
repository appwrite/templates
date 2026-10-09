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

  const appwrite = new AppwriteService(req.headers['x-appwrite-key']);
  const dodopayments = new DodoPaymentsService();

  /**
   * Stores the order if Dodo Payments reports the payment as succeeded. Both
   * the webhook and the /success redirect call this, so the order is stored
   * even if one of them never arrives.
   * @param {string} paymentId
   */
  async function fulfillPayment(paymentId) {
    const payment = await dodopayments.getPayment(paymentId);

    if (payment.status !== 'succeeded') {
      log(`Payment ${payment.payment_id} is ${payment.status}, not fulfilling.`);
      return payment;
    }

    const orderUserId = payment.metadata?.user_id;
    const orderId = payment.payment_id;

    if (!orderUserId) {
      error(`Payment ${orderId} has no user_id in its metadata.`);
      return payment;
    }

    await appwrite.setup(databaseId, tableId);

    const created = await appwrite.createOrder(
      databaseId,
      tableId,
      orderUserId,
      orderId
    );
    log(
      created
        ? `Created order row for user ${orderUserId} with Dodo Payments payment ID ${orderId}.`
        : `Order ${orderId} was already stored.`
    );
    return payment;
  }

  if (req.method === 'GET' && req.path === '/success') {
    let successUrl = '/';

    try {
      // A cancelled or failed checkout can come back without a payment ID.
      if (req.query.payment_id) {
        const payment = await fulfillPayment(req.query.payment_id);
        successUrl = payment.metadata?.success_url || successUrl;
      }
    } catch (err) {
      // The webhook still fulfills the order, so send the user on regardless.
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
      APPWRITE_DATABASE_ID: databaseId,
      APPWRITE_TABLE_ID: tableId,
    });

    return res.text(html, 200, { 'Content-Type': 'text/html; charset=utf-8' });
  }

  switch (req.path) {
    case '/checkout':
      const body = req.bodyJson;
      const fallbackUrl = req.scheme + '://' + req.headers['host'] + '/';
      const successUrl = body.successUrl ?? fallbackUrl;
      const failureUrl = body.failureUrl ?? fallbackUrl;

      // Dodo Payments returns the user to this function first, which verifies
      // the payment and then redirects to successUrl.
      const verifyUrl =
        body.verifyUrl ?? new URL('/success', successUrl).toString();

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

      if (event.type !== 'payment.succeeded') {
        log(`Ignored Dodo Payments event ${event.type}.`);
        return res.json({ success: true });
      }

      // Look the payment up instead of trusting the event payload.
      await fulfillPayment(event.data.payment_id);
      return res.json({ success: true });

    default:
      return res.text('Not Found', 404);
  }
};
