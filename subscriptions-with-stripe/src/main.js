import StripeService from './stripe'
import AppwriteService from './appwrite'
import getEnvironment from './environment'

export default async ({ req, res, log, error }) => {
  const { CANCEL_URL } = getEnvironment()

  const appwrite = AppwriteService()
  const stripe = StripeService()

  switch (req.path) {
    case '/checkout':
      const userId = req.headers['x-appwrite-user-id']
      if (!userId) {
        error('User ID not found in request.')
        return res.redirect(CANCEL_URL, 303)
      }

      const session = await stripe.checkoutSubscription(userId)
      if (!session) {
        error('Failed to create Stripe checkout session.')
        return res.redirect(CANCEL_URL, 303)
      }

      log(`Created Stripe checkout session for user ${userId}.`)
      return res.redirect(session.url, 303)

    case '/webhook':
      const event = stripe.validateWebhook(req)
      if (!event) return res.json({ success: false }, 401)

      if (event.type === 'customer.subscription.created') {
        const session = event.data.object
        const userId = session.metadata.userId

        if (await appwrite.hasSubscription(userId)) {
          error(`Subscription already exists - skipping`)
          return res.json({ success: true })
        }

        await appwrite.createSubscription(userId)
        log(`Created subscription for user ${userId}`)
      }

      if (event.type === 'customer.subscription.deleted') {
        const session = event.data.object
        const userId = session.metadata.userId

        if (!(await appwrite.hasSubscription(userId))) {
          error(`Subscription does not exist - skipping`)
          return res.json({ success: true })
        }

        await appwrite.deleteSubscription(userId)
        log(`Deleted subscription for user ${userId}`)
      }

      return res.json({ success: true })

    default:
      return res.send('Not Found', 404)
  }
}
