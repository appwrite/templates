import querystring from 'node:querystring';
import { getCorsHeaders, isOriginPermitted } from './cors.js';
import MailService from './mail.js';
import {
  getStaticFile,
  throwIfMissing,
  urlWithCodeParam,
  templateFormMessage,
} from './utils.js';

const ErrorCode = {
  INVALID_REQUEST: 'invalid-request',
  MISSING_FORM_FIELDS: 'missing-form-fields',
  SERVER_ERROR: 'server-error',
};

export default async ({ req, res, log, error }) => {
  throwIfMissing(process.env, [
    'SUBMIT_EMAIL',
    'SMTP_HOST',
    'SMTP_USERNAME',
    'SMTP_PASSWORD',
  ]);

  if (!process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS === '*') {
    log(
      'WARNING: Allowing requests from any origin - this is a security risk!'
    );
  }

  if (req.method === 'GET' && req.path === '/') {
    return res.send(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
  }

  throwIfMissing(req.headers, ['referer', 'origin']);

  if (req.headers['content-type'] !== 'application/x-www-form-urlencoded') {
    log('Invalid request.');
    return res.redirect(
      urlWithCodeParam(req.headers['referer'], 'Invalid request.')
    );
  }

  const mail = new MailService();

  if (!isOriginPermitted(req.headers['origin'])) {
    error('Origin not permitted.');
    return res.redirect(
      urlWithCodeParam(req.headers['referer'], ErrorCode.INVALID_REQUEST)
    );
  }

  const form = querystring.parse(req.body);
  try {
    throwIfMissing(form, ['email']);
    log('Form data is valid.');
  } catch (err) {
    return res.redirect(
      urlWithCodeParam(req.headers['referer'], err.message),
      301,
      getCorsHeaders(req.headers['origin'])
    );
  }

  try {
    mail.send({
      to: process.env.SUBMIT_EMAIL,
      from: /** @type {string} */ (form['email']),
      subject: `New form submission: ${origin}`,
      text: templateFormMessage(form),
    });
    log('Email sent successfully.');
  } catch (err) {
    error(err.message);
    return res.redirect(
      urlWithCodeParam(req.headers['referer'], ErrorCode.SERVER_ERROR),
      301,
      getCorsHeaders(req.headers['origin'])
    );
  }

  if (typeof form._next !== 'string' || !form._next) {
    return res.send(getStaticFile('success.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
  }

  return res.redirect(
    new URL(form._next, req.headers['origin']).toString(),
    301,
    getCorsHeaders(req.headers['origin'])
  );
};
