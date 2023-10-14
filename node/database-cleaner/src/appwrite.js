import { Client, Databases, Query } from 'node-appwrite';

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
   * @param {string} databaseId
   * @returns {Promise<Models.CollectionList>}
   */
  async listAllCollections(databaseId) {
    const totalCollections = [];
    const queries = [Query.limit(25)];

    let lastCollectionId = null;
    if (lastCollectionId) {
      queries = [...queries, Query.cursorAfter(lastCollectionId)];
    }

    while (true) {
      const collections = await this.databases.listCollections(
        databaseId,
        queries
      );

      lastCollectionId =
        collections.collections[collections.collections.length - 1].$id;

      totalCollections.push(...collections.collections);

      if (totalCollections.length === collections.total) {
        break;
      }
    }

    return totalCollections;
  }

  /**
   * @param {string} databaseId
   */
  async cleanAllCollections(databaseId) {
    const collections = await this.listAllCollections(databaseId);

    for (const collection of collections) {
      await this.cleanCollection(databaseId, collection.$id);
    }
  }

  /**
   * @param {string} databaseId
   * @param {string} collectionId
   */
  async cleanCollection(databaseId, collectionId) {
    const queries = [Query.orderAsc('$createdAt'), Query.limit(25)];
    let done = false;

    while (true) {
      const documents = await this.databases.listDocuments(
        databaseId,
        collectionId,
        queries
      );

      if (documents.documents.length === 0) {
        break;
      }

      for (const document of documents.documents) {
        const retention = process.env.RETENTION_PERIOD_DAYS ?? 30;
        const expirationDate = new Date(document.$createdAt);
        expirationDate.setDate(expirationDate.getDate() + retention);
        const today = new Date();

        if (expirationDate < today) {
          try {
            await this.databases.deleteDocument(
              databaseId,
              collectionId,
              document.$id
            );
          } catch (err) {
            throw new Error(err.message);
          }
        } else {
          done = true;
          break;
        }
      }

      if (done) {
        break;
      }
    }
  }
}

export default AppwriteService;
