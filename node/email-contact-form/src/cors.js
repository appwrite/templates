class CorsService {
  /**
   * @param {*} req - Request object
   * @param {import('./environment').default} env - Environment variables
   */
  constructor(req, env) {
    this.env = env;
    this.origin = req.headers['origin'];
  }

  /**
   * @returns {boolean} Whether the origin is allowed based on the ALLOWED_ORIGINS environment variable
   */
  isOriginPermitted() {
    if (!this.env.ALLOWED_ORIGINS || this.env.ALLOWED_ORIGINS === '*')
      return true;
    const allowedOriginsArray = this.env.ALLOWED_ORIGINS.split(',');
    return allowedOriginsArray.includes(this.origin);
  }

  /**
   * @returns {Object} Access-Control-Allow-Origin header to be returned in the response
   */
  getHeaders() {
    return {
      'Access-Control-Allow-Origin':
        this.env.ALLOWED_ORIGINS === '*' ? '*' : this.origin,
    };
  }
}

export default CorsService;
