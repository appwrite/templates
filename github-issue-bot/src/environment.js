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
    GITHUB_WEBHOOK_SECRET: getRequiredEnv('GITHUB_WEBHOOK_SECRET'),
    GITHUB_TOKEN: getRequiredEnv('GITHUB_TOKEN'),
    DISCORD_LINK: getRequiredEnv('DISCORD_LINK'),
  };
}

export default EnvironmentService;
