export function isOriginPermitted(req) {
  if (!process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS === '*')
    return true;
  const allowedOriginsArray = process.env.ALLOWED_ORIGINS.split(',');
  return allowedOriginsArray.includes(this.origin);
}

export function getCorsHeaders(req) {
  return {
    'Access-Control-Allow-Origin':
      process.env.ALLOWED_ORIGINS === '*' ? '*' : this.origin,
  };
}
