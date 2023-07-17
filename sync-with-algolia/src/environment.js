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

function EnvironmentService() {
  return {
    ALGOLIA_APP_ID: getRequiredEnv('ALGOLIA_APP_ID'),
    ALGOLIA_ADMIN_API_KEY: getRequiredEnv('ALGOLIA_ADMIN_API_KEY'),
    ALGOLIA_INDEX_ID: getRequiredEnv('ALGOLIA_INDEX_ID'),
    ALGOLIA_SEARCH_API_KEY: getRequiredEnv('ALGOLIA_SEARCH_API_KEY'),
    APPWRITE_API_KEY: getRequiredEnv('APPWRITE_API_KEY'),
    APPWRITE_DATABASE_ID: getRequiredEnv('APPWRITE_DATABASE_ID'),
    APPWRITE_COLLECTION_ID: getRequiredEnv('APPWRITE_COLLECTION_ID'),
    APPWRITE_ENDPOINT:
      process.env.APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1',
    APPWRITE_PROJECT_ID:
      process.env.APPWRITE_PROJECT_ID ??
      getRequiredEnv('APPWRITE_FUNCTION_PROJECT_ID'),
  }
}

export default EnvironmentService
