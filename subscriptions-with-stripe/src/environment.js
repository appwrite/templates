/**
 * @param {string} key
 * @return {string}
 */
function getRequiredEnv(key) {
  const value = process.env[key]
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not set`)
  }
  return value
}

/**
 * @param {string} key
 * @return {string}
 */
function getRequiredUrlEnv(key) {
  const value = getRequiredEnv(key)
  if (!isValidUrl(value)) {
    throw new Error(`Environment variable ${key} is a not valid URL`)
  }
  return value
}

/**
 * @param {string | undefined} url
 * @returns {boolean}
 */
function isValidUrl(url) {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch (err) {
    return false
  }
}

export default function getEnvironment() {
  return {
    APPWRITE_ENDPOINT: getRequiredUrlEnv('APPWRITE_ENDPOINT'),
    APPWRITE_PROJECT_ID: getRequiredEnv('APPWRITE_PROJECT_ID'),
    APPWRITE_API_KEY: getRequiredEnv('APPWRITE_API_KEY'),
    STRIPE_WEBHOOK_SECRET: getRequiredEnv('STRIPE_WEBHOOK_SECRET'),
    STRIPE_SECRET_KEY: getRequiredEnv('STRIPE_SECRET_KEY'),
    SUCCESS_URL: getRequiredUrlEnv('SUCCESS_URL'),
    CANCEL_URL: getRequiredUrlEnv('CANCEL_URL'),
    DATABASE_ID: process.env.DATABASE_ID ?? 'stripe-subscriptions',
    DATABASE_NAME: 'Stripe Subscriptions',
    COLLECTION_ID: process.env.COLLECTION_ID ?? 'subscriptions',
    COLLECTION_NAME: 'Subscriptions',
  }
}
