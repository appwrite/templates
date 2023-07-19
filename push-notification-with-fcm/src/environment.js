/**
 * @param {string} key
 * @return {string}
 */
function getRequiredEnv(key) {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

function EnvironmentService() {
  return {
    FIREBASE_TYPE: getRequiredEnv('FIREBASE_TYPE'),
    FIREBASE_PROJECT_ID: getRequiredEnv('FIREBASE_PROJECT_ID'),
    FIREBASE_PRIVATE_KEY_ID: getRequiredEnv('FIREBASE_PRIVATE_KEY_ID'),
    FIREBASE_PRIVATE_KEY: getRequiredEnv('FIREBASE_PRIVATE_KEY'),
    FIREBASE_CLIENT_EMAIL: getRequiredEnv('FIREBASE_CLIENT_EMAIL'),
    FIREBASE_CLIENT_ID: getRequiredEnv('FIREBASE_CLIENT_ID'),
    FIREBASE_AUTH_URI: getRequiredEnv('FIREBASE_AUTH_URI'),
    FIREBASE_TOKEN_URI: getRequiredEnv('FIREBASE_TOKEN_URI'),
    FIREBASE_AUTH_PROVIDER_X509_CERT_URL: getRequiredEnv(
      'FIREBASE_AUTH_PROVIDER_X509_CERT_URL'
    ),
    FIREBASE_CLIENT_X509_CERT_URL: getRequiredEnv(
      'FIREBASE_CLIENT_X509_CERT_URL'
    ),
    FIREBASE_DATABASE_URL: getRequiredEnv('FIREBASE_DATABASE_URL'),
  };
}

export default EnvironmentService;
