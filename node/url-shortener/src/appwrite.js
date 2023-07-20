import { Client, Databases } from 'node-appwrite';

/**
 * @typedef {Object} URLEntry
 * @property {string} url
 *
 * @typedef {import('node-appwrite').Models.Document & URLEntry} URLEntryDocument
 */

class AppwriteService {
  /**
   * @param {import('./environment').default} env
   */
  constructor(env) {
    this.env = env;

    const client = new Client();
    client
      .setEndpoint(env.APPWRITE_ENDPOINT)
      .setProject(env.APPWRITE_PROJECT_ID)
      .setKey(env.APPWRITE_API_KEY);

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
          this.env.DATABASE_ID,
          this.env.COLLECTION_ID,
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
          this.env.DATABASE_ID,
          this.env.COLLECTION_ID,
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
      await this.databases.get(this.env.DATABASE_ID);
      return true;
    } catch (err) {
      if (err.code !== 404) throw err;
      return false;
    }
  }

  async setupURLEntryDatabase() {
    try {
      await this.databases.create(this.env.DATABASE_ID, this.env.DATABASE_NAME);
      await this.databases.createCollection(
        this.env.DATABASE_ID,
        this.env.COLLECTION_ID,
        this.env.COLLECTION_NAME
      );
      await this.databases.createUrlAttribute(
        this.env.DATABASE_ID,
        this.env.COLLECTION_ID,
        'url',
        true
      );
    } catch (err) {
      // If resource already exists, we can ignore the error
      if (err.code !== 409) throw err;
    }
  }
}

export default AppwriteService;
