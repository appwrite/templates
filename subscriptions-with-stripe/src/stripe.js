const getEnvironment = require("./environment");
const stripe = require("stripe");

module.exports = function StripeService() {
  const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUCCESS_URL, CANCEL_URL } =
    getEnvironment();

  // Note: stripe cjs API types are faulty
  /** @type {import('stripe').Stripe} */
  // @ts-ignore
  const stripeClient = stripe(STRIPE_SECRET_KEY);

  return {
    /**
     * @param {string} userId
     */
    checkoutSubscription: async function (userId) {
      try {
        return await stripeClient.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: "Premium Subscription",
                },
                unit_amount: 1000,
                recurring: {
                  interval: "year",
                },
              },
              quantity: 1,
            },
          ],
          success_url: SUCCESS_URL,
          cancel_url: CANCEL_URL,
          client_reference_id: userId,
          metadata: {
            userId,
          },
          mode: "subscription",
        });
      } catch (err) {
        return null;
      }
    },
    /**
     * @returns {import("stripe").Stripe.DiscriminatedEvent | null}
     */
    validateWebhook: function (req) {
      try {
        const event = stripeClient.webhooks.constructEvent(
          req.body,
          req.headers["stripe-signature"],
          STRIPE_WEBHOOK_SECRET
        );
        return /** @type {import("stripe").Stripe.DiscriminatedEvent} */ (
          event
        );
      } catch (err) {
        return null;
      }
    },
  };
};
