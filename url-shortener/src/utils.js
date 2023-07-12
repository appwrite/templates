import { customAlphabet } from 'nanoid'

/**
 * @param {string | undefined} url
 * @returns {boolean}
 */
export function isValidURL(url) {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch (err) {
    return false
  }
}

const ALPHABET =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const nanoid = customAlphabet(ALPHABET)

export const generateShortCode = () => nanoid(6)
