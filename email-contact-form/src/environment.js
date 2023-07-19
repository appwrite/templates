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
    SUBMIT_EMAIL: getRequiredEnv('SUBMIT_EMAIL'),
    SMTP_HOST: getRequiredEnv('SMTP_HOST'),
    SMTP_PORT: process.env.SMTP_PORT || 587,
    SMTP_USERNAME: getRequiredEnv('SMTP_USERNAME'),
    SMTP_PASSWORD: getRequiredEnv('SMTP_PASSWORD'),
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || '*',
  };
}

export default EnvironmentService;
