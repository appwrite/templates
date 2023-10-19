import { Client, Storage, Query } from 'node-appwrite';
import { getExpiryDate } from './util.js';

class AppwriteService {
  constructor() {
    const client = new Client()
      .setEndpoint(
        process.env.APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1'
      )
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);
    this.storage = new Storage(client);
  }

  /**
   * Clean up files from the storage bucket by removing files older than a specified retention period.
   *
   * This function retrieves files from the specified bucket, ordered by creation date in ascending order,
   * and deletes files that are older than the calculated expiry date based on the retention period.
   *
   * @param {string} bucketId - The ID of the storage bucket to clean.
   * @returns {Promise<void>} A Promise that resolves when the bucket is cleaned.
   */
  async cleanBucket(bucketId) {
    let hasNextPage = true;
    const queries = [
      Query.smallerThan('$createdAt', getExpiryDate()),
      Query.limit(100),
    ];
    do {
      const response = await this.storage.listFiles(bucketId, queries);
      await Promise.all(
        response.files.map((file) =>
          this.storage.deleteFile(bucketId, file.$id)
        )
      );
      hasNextPage = response.files.length > 0;
    } while (hasNextPage);
  }
}

export default AppwriteService;
