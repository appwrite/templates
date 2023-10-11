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
   * @param {string} collectionId
   * @returns {Promise<void>}
   */
  async cleanCollection(databaseId, collectionId) {
    const queries = [Query.orderAsc('$createdAt')];
    let done = false;

    while (!done) {
      const documents = await this.databases.listDocuments(
        databaseId,
        collectionId,
        queries
      );

      for (const document of documents.documents) {
        const retention = process.env.RETENTION_PERIOD_DAYS ?? 30;
        const expirationDate = new Date(document.$createdAt);
        expirationDate.setDate(expirationDate.getDate() + retention);
        const today = new Date();

        console.log(`Expiration date: ${expirationDate}`);

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
        }
      }
    }
  }
}

export default AppwriteService;
