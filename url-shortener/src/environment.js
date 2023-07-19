import { isValidURL } from './utils';

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

/**
 * @param {string} key
 * @return {string}
 */
function getRequiredUrlEnv(key) {
  const value = getRequiredEnv(key);
  if (!isValidURL(value)) {
    throw new Error(`Environment variable ${key}=${value} is a not valid URL`);
  }
  return value;
}

function EnvironmentService() {
  return {
    APPWRITE_API_KEY: getRequiredEnv('APPWRITE_API_KEY'),
    APPWRITE_ENDPOINT: getRequiredUrlEnv('APPWRITE_ENDPOINT'),
    APPWRITE_PROJECT_ID: getRequiredEnv('APPWRITE_PROJECT_ID'),
    SHORT_DOMAIN: getRequiredEnv('SHORT_DOMAIN'),
    DATABASE_ID: process.env.DATABASE_ID ?? 'url-shortener',
    DATABASE_NAME: 'URL Shortener',
    COLLECTION_ID: process.env.COLLECTION_ID ?? 'urls',
    COLLECTION_NAME: 'URLs',
  };
}

export default EnvironmentService;
