import { Client, Databases } from 'node-appwrite';

/**
 * @typedef {Object} URLEntry
 * @property {string} url
 *
 * @typedef {import('node-appwrite').Models.Document & URLEntry} URLEntryDocument
 */

class AppwriteService {
  constructor() {
    const client = new Client();
    client
      .setEndpoint(
        process.env.APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1'
      )
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    this.databases = new Databases(client);
  }

  /**
   * @param {string} shortCode
   * @returns {Promise<URLEntryDocument | null>}
   */
  async getURLEntry(shortCode) {
    try {
      const document = /** @type {URLEntryDocument} */ (
        await this.databases.getDocument(
          process.env.APPWRITE_DATABASE_ID,
          process.env.APPWRITE_COLLECTION_ID,
          shortCode
        )
      );

      return document;
    } catch (err) {
      if (err.code !== 404) throw err;
      return null;
    }
  }

  /**
   * @param {string} url
   * @param {string} shortCode
   * @returns {Promise<URLEntryDocument | null>}
   */
  async createURLEntry(url, shortCode) {
    try {
      const document = /** @type {URLEntryDocument} */ (
        await this.databases.createDocument(
          process.env.APPWRITE_DATABASE_ID,
          process.env.APPWRITE_COLLECTION_ID,
          shortCode,
          {
            url,
          }
        )
      );

      return document;
    } catch (err) {
      if (err.code !== 409) throw err;
      return null;
    }
  }

  /**
   * @returns {Promise<boolean>}
   */
  async doesURLEntryDatabaseExist() {
    try {
      await this.databases.get(process.env.APPWRITE_DATABASE_ID);
      return true;
    } catch (err) {
      if (err.code !== 404) throw err;
      return false;
    }
  }

  async setupURLEntryDatabase() {
    try {
      await this.databases.create(
        process.env.APPWRITE_DATABASE_ID,
        'URL Shortener'
      );
    } catch (err) {
      // If resource already exists, we can ignore the error
      if (err.code !== 409) throw err;
    }
    try {
      await this.databases.createCollection(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_COLLECTION_ID,
        'URLs'
      );
    } catch (err) {
      if (err.code !== 409) throw err;
    }
    try {
      await this.databases.createUrlAttribute(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_COLLECTION_ID,
        'url',
        true
      );
    } catch (err) {
      if (err.code !== 409) throw err;
    }
  }
}

export default AppwriteService;
