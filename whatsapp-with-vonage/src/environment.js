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
  VONAGE_API_KEY = getRequiredEnv('VONAGE_API_KEY');
  VONAGE_API_SECRET = getRequiredEnv('VONAGE_API_SECRET');
  VONAGE_API_SIGNATURE_SECRET = getRequiredEnv('VONAGE_API_SIGNATURE_SECRET');
}

export default EnvironmentService;
