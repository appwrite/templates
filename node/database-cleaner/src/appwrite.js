import { Client, Databases, Query } from 'node-appwrite';
import { getExpiryDate } from './utils.js'

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
    const queries = [Query.orderAsc('$createdAt'), Query.limit(25)];
    let done = false;

    do {
      const collections = await this.databases.listCollections(
        databaseId,
        queries
      );

      const lastCollectionId =
        collections.collections[collections.collections.length - 1].$id;

      const cursorPos = queries.findIndex((x) => x.includes('cursorAfter'));

      if (cursorPos !== -1) {
        queries.splice(cursorPos, 1);
      }

      queries.push(Query.cursorAfter(lastCollectionId));

      totalCollections.push(...collections.collections);

      if (totalCollections.length === collections.total) {
        done = true;
      }
    } while (!done)

    return totalCollections;
  }

  /**
   * @param {string} databaseId
   * @param {string} collectionId
   */
  async cleanCollection(databaseId, collectionId) {
    const expiryDate = getExpiryDate()
    const queries = [Query.orderAsc('$createdAt'), Query.lessThan('$createdAt', expiryDate), Query.limit(10)];
    let done = false;

    do {
      const documents = await this.databases.listDocuments(
        databaseId,
        collectionId,
        queries
      );

      done = documents.documents.length > 0;

      try {
        await Promise.all(
          documents.documents.map((file) =>
            this.databases.deleteDocument(
              databaseId,
              collectionId,
              document.$id
            )
          )
        );
      } catch (err) {
        throw new Error(err.message);
      }
    } while (!done)
  }
}

export default AppwriteService;
