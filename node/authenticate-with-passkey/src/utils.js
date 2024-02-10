import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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
 * Returns a new unique challenge for client to use when creating passkey
 * @returns {string} Unique challenge token
 */
export function getNewChallenge() {
  return Math.random().toString(36).substring(2);
}

/**
 * Converts challenge token to safely storable token
 * @param {string} challenge challenge token from getNewChallenge()
 * @returns {string} Encoded challenge safe to store in database
 */
export function convertChallenge(challenge) {
  return btoa(challenge).replaceAll('=', '');
}

/**
 * Extracts useful information from registration info.
 * @returns {*} Object with info nessessary for later sign-in
 */
export function getRegistrationCredentials(registrationInfo) {
  const {credentialPublicKey, counter, credentialID} = registrationInfo;
  return {
      credentialID: uintToString(credentialID),
      credentialPublicKey: uintToString(credentialPublicKey),
      counter,
  }
}
