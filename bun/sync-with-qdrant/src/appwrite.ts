import { Client, Databases, Query } from 'node-appwrite';

class AppwriteService {
  databases: Databases;

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
   * Retrieves the entire collection of documents from an Appwrite database.
   *
   * @param {string} databaseId
   * @param {string} collectionId
   * @returns {Promise<import('node-appwrite').Models.Document[]>}
   */
  async getAllDocuments(databaseId: string, collectionId: string) {
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