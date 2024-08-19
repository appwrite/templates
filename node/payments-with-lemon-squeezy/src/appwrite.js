import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

class AppwriteService {
  constructor(apiKey) {
    const client = new Client();
    client
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(apiKey);

    this.databases = new Databases(client);

    this.setup();
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

  async createOrder(databaseId, collectionId, userId, orderId) {
    await this.databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(),
      {
        userId,
        orderId,
      },
      [Permission.read(Role.user(userId))]
    );
  }
}

export default AppwriteService;
