import { Client, Databases, Query } from 'node-appwrite';

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
   * Retrieves the entire collection of documents from an Appwrite database.
   *
   * @param {string} databaseId
   * @param {string} collectionId
   * @returns {Promise<import('node-appwrite').Models.Document[]>}
   */
  async getAllDocuments(databaseId, collectionId) {
    const cumulative = [];

    let cursor = null;
    do {
      const queries = [Query.limit(100)];

      if (cursor) {
        queries.push(Query.cursorAfter(cursor));
      }

      const { documents } = await this.databases.listDocuments(
        databaseId,
        collectionId,
        queries
      );

      if (documents.length === 0) {
        break;
      }

      cursor = documents[documents.length - 1].$id;

      cumulative.push(...documents);
    } while (cursor);

    return cumulative;
  }
}

export default AppwriteService;
