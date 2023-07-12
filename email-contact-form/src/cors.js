const getEnvironment = require("./environment");

/**
 * @param {string} origin
 */
module.exports = function CorsService(origin) {
  const { ALLOWED_ORIGINS } = getEnvironment();

  return {
    isOriginPermitted: function () {
      if (!ALLOWED_ORIGINS || ALLOWED_ORIGINS === "*") return true;
      const allowedOriginsArray = ALLOWED_ORIGINS.split(",");
      return allowedOriginsArray.includes(origin);
    },
    getHeaders: function () {
      return {
        "Access-Control-Allow-Origin": ALLOWED_ORIGINS === "*" ? "*" : origin,
      };
    },
  };
};
