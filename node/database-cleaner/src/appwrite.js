import { Client, Databases, Query } from 'node-appwrite';
import { getExpiryDate } from './utils.js';

class AppwriteService {
  constructor(apiKey) {
    const client = new Client();
    client
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(apiKey);

    this.databases = new Databases(client);
  }

  /**
   * @param {string} databaseId
   * @param {string} collectionId
   */
  async cleanCollection(databaseId, collectionId) {
    let response;
    const queries = [
      Query.lessThan('$createdAt', getExpiryDate()),
      Query.limit(25),
    ];
    do {
      response = await this.databases.listDocuments(
        databaseId,
        collectionId,
        queries
      );
      await Promise.all(
        response.documents.map((document) =>
          this.databases.deleteDocument(databaseId, collectionId, document.$id)
        )
      );
    } while (response.documents.length > 0);
  }
}

export default AppwriteService;
