import { Client, Databases } from 'node-appwrite';

const Subscriptions = {
  PREMIUM: 'premium',
};

class AppwriteService {
  constructor() {
    const client = new Client();
    client
      .setEndpoint(
        process.env.APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1'
      )
      .setProject(
        process.env.APPWRITE_PROJECT_I ??
          process.env.APPWRITE_FUNCTION_PROJECT_ID
      )
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    this.databases = databases;
  }

  /**
   * @returns {Promise<boolean>}
   */
  async doesSubscribersDatabaseExist() {
    try {
      await this.databases.get(
        process.env.DATABASE_ID ?? 'stripe-subscriptions'
      );
      return true;
    } catch (err) {
      if (err.code === 404) return false;
      throw err;
    }
  }

  async setupSubscribersDatabase() {
    try {
      await this.databases.create(
        process.env.DATABASE_ID ?? 'stripe-subscriptions',
        'Stripe Subscriptions'
      );
      await this.databases.createCollection(
        process.env.DATABASE_ID ?? 'stripe-subscriptions',
        process.env.COLLECTION_ID ?? 'subscriptions',
        'Subscriptions'
      );
      await this.databases.createStringAttribute(
        process.env.DATABASE_ID ?? 'stripe-subscriptions',
        process.env.COLLECTION_ID ?? 'subscriptions',
        'userId',
        255,
        true
      );
      await this.databases.createStringAttribute(
        process.env.DATABASE_ID ?? 'stripe-subscriptions',
        process.env.COLLECTION_ID ?? 'subscriptions',
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
        process.env.DATABASE_ID ?? 'stripe-subscriptions',
        process.env.COLLECTION_ID ?? 'subscriptions',
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
        process.env.DATABASE_ID ?? 'stripe-subscriptions',
        process.env.COLLECTION_ID ?? 'subscriptions',
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
        process.env.DATABASE_ID ?? 'stripe-subscriptions',
        process.env.COLLECTION_ID ?? 'subscriptions',
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
