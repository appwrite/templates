import { Client, Storage, Query } from 'node-appwrite';
import { getExpiryDate } from './util.js';

class AppwriteService {
  constructor(apiKey) {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(apiKey);
    this.storage = new Storage(client);
  }

  /**
   * Clean up files from the storage bucket by removing files older than a specified retention period.
   *
   * @param {string} bucketId - The ID of the storage bucket to clean.
   * @returns {Promise<void>} A Promise that resolves when the bucket is cleaned.
   */
  async cleanBucket(bucketId) {
    let response;
    const queries = [
      Query.lessThan('$createdAt', getExpiryDate()),
      Query.limit(25),
    ];
    do {
      response = await this.storage.listFiles(bucketId, queries);
      await Promise.all(
        response.files.map((file) =>
          this.storage.deleteFile(bucketId, file.$id)
        )
      );
    } while (response.files.length > 0);
  }
}

export default AppwriteService;
