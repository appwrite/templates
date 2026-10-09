import { Client, Databases, Permission, Role } from 'node-appwrite';

class AppwriteService {
  constructor(apiKey) {
    const client = new Client();
    client
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(apiKey);

    this.databases = new Databases(client);
  }

  async setup() {
    const databaseId = process.env.APPWRITE_DATABASE_ID ?? 'orders';
    const collectionId = process.env.APPWRITE_COLLECTION_ID ?? 'orders';

    if ((await this.doesOrdersDatabaseExist(databaseId)) == true) {
      return;
    }

    await this.setupOrdersDatabase(databaseId, collectionId);
  }

  async doesOrdersDatabaseExist(databaseId) {
    try {
      await this.databases.get(databaseId);
      return true;
    } catch (err) {
      if (err.code !== 404) throw err;
      return false;
    }
  }

  async setupOrdersDatabase(databaseId, collectionId) {
    try {
      await this.databases.create(databaseId, 'Orders Database');
    } catch (err) {
      if (err.code !== 409) throw err;
    }

    try {
      await this.databases.createCollection(
        databaseId,
        collectionId,
        'Orders Collection',
        undefined,
        true
      );
    } catch (err) {
      if (err.code !== 409) throw err;
    }

    try {
      await this.databases.createStringAttribute(
        databaseId,
        collectionId,
        'userId',
        255,
        true
      );
    } catch (err) {
      if (err.code !== 409) throw err;
    }

    try {
      await this.databases.createStringAttribute(
        databaseId,
        collectionId,
        'orderId',
        255,
        true
      );
    } catch (err) {
      if (err.code !== 409) throw err;
    }
  }

  /**
   * Stores a paid order. The webhook and the /success redirect can both run
   * for the same order, possibly at the same time. Using the order ID as the
   * document ID makes the database reject the second write with a 409, so the
   * order is only ever stored once.
   * @returns {Promise<boolean>} false if the order was already stored
   */
  async createOrder(databaseId, collectionId, userId, orderId) {
    try {
      await this.databases.createDocument(
        databaseId,
        collectionId,
        orderId,
        {
          userId,
          orderId,
        },
        [Permission.read(Role.user(userId))]
      );
      return true;
    } catch (err) {
      if (err.code !== 409) throw err;
      return false;
    }
  }
}

export default AppwriteService;
