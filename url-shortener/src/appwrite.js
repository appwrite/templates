import { Client, Databases } from 'node-appwrite'
import getEnvironment from './environment'

/**
 * @typedef {Object} URLEntry
 * @property {string} url
 *
 * @typedef {import('node-appwrite').Models.Document & URLEntry} URLEntryDocument
 */

export default function AppwriteService() {
  const {
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_API_KEY,
    DATABASE_ID,
    DATABASE_NAME,
    COLLECTION_ID,
    COLLECTION_NAME,
  } = getEnvironment()

  const client = new Client()
  client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY)

  const databases = new Databases(client)

  return {
    /**
     * @param {string} shortCode
     * @returns {Promise<URLEntryDocument | null>}
     */
    getURLEntry: async function (shortCode) {
      try {
        const document = /** @type {URLEntryDocument} */ (
          await databases.getDocument(DATABASE_ID, COLLECTION_ID, shortCode)
        )

        return document
      } catch (err) {
        if (err.code !== 404) throw err
        return null
      }
    },

    /**
     * @param {string} url
     * @param {string} shortCode
     * @returns {Promise<URLEntryDocument | null>}
     */
    createURLEntry: async function (url, shortCode) {
      try {
        const document = /** @type {URLEntryDocument} */ (
          await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            shortCode,
            {
              url,
            }
          )
        )

        return document
      } catch (err) {
        if (err.code !== 409) throw err
        return null
      }
    },

    /**
     * @returns {Promise<boolean>}
     */
    doesURLEntryDatabaseExist: async function () {
      try {
        await databases.get(DATABASE_ID)
        return true
      } catch (err) {
        if (err.code !== 404) throw err
        return false
      }
    },

    setupURLEntryDatabase: async function () {
      try {
        await databases.create(DATABASE_ID, DATABASE_NAME)
        await databases.createCollection(
          DATABASE_ID,
          COLLECTION_ID,
          COLLECTION_NAME
        )
        await databases.createUrlAttribute(
          DATABASE_ID,
          COLLECTION_ID,
          'url',
          true
        )
      } catch (err) {
        // If resource already exists, we can ignore the error
        if (err.code !== 409) throw err
      }
    },
  }
}
