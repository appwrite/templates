import { Client, Storage, Query } from 'node-appwrite';
import { getExpiryDate } from './util.js';

class AppwriteService {
  defaultQuery = [Query.orderAsc('$createdAt')];

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
   * Clean up all storage buckets by removing files older than a specified retention period.
   *
   * This function retrieves a list of all storage buckets, and for each bucket,
   * it calls the cleanBucket function to remove files that are older than the calculated expiry date
   * based on the retention period.
   *
   * @returns {Promise<void>} A Promise that resolves when all buckets are cleaned.
   */
  async cleanAllBuckets() {
    const buckets = await this.getBuckets();
    for (const bucket of buckets) {
      await this.cleanBucket(bucket.$id);
    }
  }

  /**
   * Retrieves the list of buckets.
   *
   * @param {Query[]} queries - An array of queries to filter and sort the results. Defaults to this.defaultQuery.
   * @param {Cursor|null} cursor - A cursor for pagination. Pass null to start from the beginning.
   * @returns {Promise<Object[]>} An array of buckets.
   */
  async getBuckets(queries = this.defaultQuery, cursor = null) {
    const currentQueries = [...queries, Query.limit(100)];

    if (cursor) {
      currentQueries.push(Query.cursorAfter(cursor.$id));
    }
    const response = await this.storage.listBuckets(queries);
    if (response.buckets.length < 100) {
      return response.buckets;
    }

    const nextCursor = response.buckets[response.buckets.length - 1];
    return [
      ...response.buckets,
      ...(await getBuckets(collectionId, queries, nextCursor)),
    ];
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
    const queries = [Query.orderAsc('$createdAt'), Query.limit(100)];
    outerLoop: while (true) {
      const fileList = await this.storage.listFiles(bucketId, queries);
      const files = fileList.files;
      if (files.length == 0) {
        break outerLoop;
      }
      const expiryDate = getExpiryDate(); // get the expiryDate using the RETENTION_PERIOD
      for (const file of files) {
        if (new Date(file.$createdAt) < expiryDate) {
          await this.storage.deleteFile(bucketId, file.$id);
        } else {
          break outerLoop; // this will break out of both the loops
        }
      }
    }
  }
}

export default AppwriteService;
