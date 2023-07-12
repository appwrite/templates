import querystring from 'node:querystring'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import getEnvironment from './environment'
import CorsService from './cors'
import MailService from './mail'

const ErrorCode = {
  INVALID_REQUEST: 'invalid-request',
  MISSING_FORM_FIELDS: 'missing-form-fields',
  SERVER_ERROR: 'server-error',
}

const ROUTES = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/success.html': 'success.html',
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const staticFolder = path.join(__dirname, '../static')

export default async ({ req, res, log, error }) => {
  const { SUBMIT_EMAIL, ALLOWED_ORIGINS } = getEnvironment()

  if (ALLOWED_ORIGINS === '*') {
    log('WARNING: Allowing requests from any origin - this is a security risk!')
  }

  if (req.method === 'GET') {
    const route = ROUTES[req.path]
    const html = readFileSync(path.join(staticFolder, route))
    return res.send(html.toString(), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    })
  }

  const referer = req.headers['referer']
  const origin = req.headers['origin']
  if (!referer || !origin) {
    log('Missing referer or origin headers.')
    return res.json({ error: 'Missing referer or origin headers.' }, 400)
  }

  if (req.headers['content-type'] !== 'application/x-www-form-urlencoded') {
    log('Invalid request.')
    return res.redirect(urlWithCodeParam(referer, ErrorCode.INVALID_REQUEST))
  }

  const cors = CorsService(origin)
  const mail = MailService()

  if (!cors.isOriginPermitted()) {
    error('Origin not permitted.')
    return res.redirect(urlWithCodeParam(referer, ErrorCode.INVALID_REQUEST))
  }

  const form = querystring.parse(req.body)

  if (
    !(
      form.email &&
      form._next &&
      typeof form.email === 'string' &&
      typeof form._next === 'string'
    )
  ) {
    error('Missing form data.')
    return res.redirect(
      urlWithCodeParam(referer, ErrorCode.MISSING_FORM_FIELDS),
      301,
      cors.getHeaders()
    )
  }
  log('Form data is valid.')

  try {
    mail.send({
      to: SUBMIT_EMAIL,
      from: form.email,
      subject: `New form submission: ${origin}`,
      text: templateFormMessage(form),
    })
  } catch (err) {
    error(err.message)
    return res.redirect(
      urlWithCodeParam(referer, ErrorCode.SERVER_ERROR),
      301,
      cors.getHeaders()
    )
  }

  log('Email sent successfully.')

  return res.redirect(
    new URL(form._next, origin).toString(),
    301,
    cors.getHeaders()
  )
}

/**
 * Build a message from the form data.
 * @param {import("node:querystring").ParsedUrlQuery} form
 * @returns  {string}
 */
function templateFormMessage(form) {
  return `You've received a new message.\n
${Object.entries(form)
  .filter(([key]) => key !== '_next')
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}`
}

/**
 * @param {string} baseUrl
 * @param {string} codeParam
 */
function urlWithCodeParam(baseUrl, codeParam) {
  const url = new URL(baseUrl)
  url.searchParams.set('code', codeParam)
  return url.toString()
}
