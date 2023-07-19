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
 * @return {number | undefined}
 */
function getNumberEnv(key) {
  const value = process.env[key];
  if (value === undefined) {
    return undefined;
  }

  try {
    return parseInt(value);
  } catch (e) {
    throw new Error(`Environment variable ${key} is not a number`);
  }
}

function EnvironmentService() {
  return {
    OPENAI_API_KEY: getRequiredEnv('OPENAI_API_KEY'),
    OPENAI_MAX_TOKENS: getNumberEnv('OPENAI_MAX_TOKENS') ?? 64,
  };
}

export default EnvironmentService;
