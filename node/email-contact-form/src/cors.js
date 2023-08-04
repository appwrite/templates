export function isOriginPermitted(req) {
  if (
    !process.env.ALLOWED_ORIGINS ||
    process.env.ALLOWED_ORIGINS === '*' ||
    !req.headers['origin']
  )
    return true;
  const allowedOriginsArray = process.env.ALLOWED_ORIGINS.split(',');
  return allowedOriginsArray.includes(req.headers['origin']);
}

export function getCorsHeaders(req) {
  if (!req.headers['origin']) return {};
  return {
    'Access-Control-Allow-Origin':
      !process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS === '*'
        ? '*'
        : req.headers['origin'],
  };
}
