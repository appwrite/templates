/**
 * @param {string} origin Origin header of the request
 */
export default function CorsService(origin, environment) {
  const { ALLOWED_ORIGINS } = environment

  return {
    /**
     * @returns {boolean} Whether the origin is allowed based on the ALLOWED_ORIGINS environment variable
     */
    isOriginPermitted: function () {
      if (!ALLOWED_ORIGINS || ALLOWED_ORIGINS === '*') return true
      const allowedOriginsArray = ALLOWED_ORIGINS.split(',')
      return allowedOriginsArray.includes(origin)
    },
    /**
     * @returns {Object} Access-Control-Allow-Origin header to be returned in the response
     */
    getHeaders: function () {
      return {
        'Access-Control-Allow-Origin': ALLOWED_ORIGINS === '*' ? '*' : origin,
      }
    },
  }
}
