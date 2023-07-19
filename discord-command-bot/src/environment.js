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

export default function EnvironmentService() {
  return {
    DISCORD_PUBLIC_KEY: getRequiredEnv('DISCORD_PUBLIC_KEY'),
  };
}
