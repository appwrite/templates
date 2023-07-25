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

class EnvironmentService {
  FIREBASE_PROJECT_ID = getRequiredEnv('FIREBASE_PROJECT_ID');
  FIREBASE_PRIVATE_KEY = getRequiredEnv('FIREBASE_PRIVATE_KEY');
  FIREBASE_CLIENT_EMAIL = getRequiredEnv('FIREBASE_CLIENT_EMAIL');
  FIREBASE_DATABASE_URL = getRequiredEnv('FIREBASE_DATABASE_URL');
}

export default EnvironmentService;
