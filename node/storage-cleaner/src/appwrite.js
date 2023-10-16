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

  async cleanAllBuckets() {
    const buckets = await this.getBuckets();
    for (const bucket of buckets) {
      await this.cleanBucket(bucket.$id);
    }
  }

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
