import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import nodemailer from 'nodemailer';

/**
 * Throws an error if any of the keys are missing from the object
 * @param {*} obj
 * @param {string[]} keys
 * @throws {Error}
 */
export function throwIfMissing(obj, keys) {
  const missing = [];
  for (let key of keys) {
    if (!(key in obj) || !obj[key]) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticFolder = path.join(__dirname, '../static');

/**
 * Returns the contents of a file in the static folder
 * @param {string} fileName
 * @returns {string} Contents of static/{fileName}
 */
export function getStaticFile(fileName) {
  return fs.readFileSync(path.join(staticFolder, fileName)).toString();
}

/**
 * Build a message from the form data.
 * @param {import("node:querystring").ParsedUrlQuery} form
 * @returns {string}
 */
export function templateFormMessage(form) {
  return `You've received a new message.\n
${Object.entries(form)
  .filter(([key]) => key !== '_next')
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}`;
}

/**
 * @param {string} baseUrl
 * @param {string} codeParam
 * @returns {string}
 */
export function urlWithCodeParam(baseUrl, codeParam) {
  const url = new URL(baseUrl);
  url.searchParams.set('code', codeParam);
  return url.toString();
}

/**
 * Send an email using the SMTP credentials in the environment
 * @param {any} options
 * @returns {Promise<void>}
 */
export async function sendEmail(options) {
  const transport = nodemailer.createTransport({
    // @ts-ignore
    // Bypass some weird type checks
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  await transport.sendMail(options);
}
