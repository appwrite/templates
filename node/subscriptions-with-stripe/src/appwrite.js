import { Client, Databases } from 'node-appwrite';

const Subscriptions = {
  PREMIUM: 'premium',
};

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

    const databases = new Databases(client);
    this.databases = databases;
  }

  /**
   * @returns {Promise<boolean>}
   */
  async doesSubscribersDatabaseExist() {
    try {
      await this.databases.get(this.env.DATABASE_ID);
      return true;
    } catch (err) {
      if (err.code === 404) return false;
      throw err;
    }
  }

  async setupSubscribersDatabase() {
    try {
      await this.databases.create(this.env.DATABASE_ID, this.env.DATABASE_NAME);
      await this.databases.createCollection(
        this.env.DATABASE_ID,
        this.env.COLLECTION_ID,
        this.env.COLLECTION_NAME
      );
      await this.databases.createStringAttribute(
        this.env.DATABASE_ID,
        this.env.COLLECTION_ID,
        'userId',
        255,
        true
      );
      await this.databases.createStringAttribute(
        this.env.DATABASE_ID,
        this.env.COLLECTION_ID,
        'subscriptionType',
        255,
        true
      );
    } catch (err) {
      // If resource already exists, we can ignore the error
      if (err.code !== 409) throw err;
    }
  }

  /**
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async hasSubscription(userId) {
    try {
      await this.databases.getDocument(
        this.env.DATABASE_ID,
        this.env.COLLECTION_ID,
        userId
      );
      return true;
    } catch (err) {
      if (err.code !== 404) throw err;
      return false;
    }
  }

  /**
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async deleteSubscription(userId) {
    try {
      await this.databases.deleteDocument(
        this.env.DATABASE_ID,
        this.env.COLLECTION_ID,
        userId
      );
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async createSubscription(userId) {
    try {
      await this.databases.createDocument(
        this.env.DATABASE_ID,
        this.env.COLLECTION_ID,
        userId,
        {
          subscriptionType: Subscriptions.PREMIUM,
        }
      );
      return true;
    } catch (err) {
      return false;
    }
  }
}

export default AppwriteService;
