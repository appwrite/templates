import { Client, Databases, ID, Storage } from 'node-appwrite';
import fs from 'node:fs';
import path from 'node:path';
// IMPORTANT: Storage.createFile looks for an instance of File from 'node-fetch-native-with-agent'
// (used internally by the Appwrite Node SDK). Passing a Blob will fail with `reading 'size'`.
import { File } from 'node-fetch-native-with-agent';

class AppwriteService {
  constructor(apiKey) {
    const client = new Client();
    client
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(apiKey);

    this.databases = new Databases(client);
    this.storage = new Storage(client);
  }

  /**
   * Create a file in Appwrite Storage.
   * Accepts a Web File, Blob, or Buffer. Will normalize to the File class that Appwrite expects.
   * @param {string} bucketId
   * @param {File|Blob|Buffer} fileLike
   * @param {object} opts
   * @param {string} [opts.fileName]
   * @param {string} [opts.mimeType]
   */
  async createFile(bucketId, fileLike, opts = {}) {
    const fileName = opts.fileName || 'image.png';
    const mimeType = opts.mimeType || 'image/png';

    let file = fileLike;
    // Normalize to File type expected by SDK
    if (!(file instanceof File)) {
      if (file && typeof file.arrayBuffer === 'function') {
        // It's a Blob
        const ab = await file.arrayBuffer();
        file = new File([ab], fileName, { type: mimeType });
      } else if (Buffer.isBuffer(file)) {
        file = new File([file], fileName, { type: mimeType });
      } else {
        throw new Error('createFile expects a File, Blob, or Buffer');
      }
    }

    return await this.storage.createFile(bucketId, ID.unique(), file);
  }

  /**
   * Create a file from a local filesystem path.
   * @param {string} bucketId
   * @param {string} filePath
   */
  async createFileFromPath(bucketId, filePath) {
    const buffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const file = new File([buffer], fileName, { type: 'image/png' });
    return await this.storage.createFile(bucketId, ID.unique(), file);
  }

  /**
   * @param {string} bucketId
   * @returns {Promise<boolean>}
   */
  async doesGeneratedImageBucketExist(bucketId) {
    try {
      await this.storage.getBucket(bucketId);
      return true;
    } catch (err) {
      if (err.code === 404) return false;
      throw err;
    }
  }

  async setupGeneratedImageBucket(bucketId) {
    try {
      await this.storage.createBucket(bucketId, 'Image generated');
    } catch (err) {
      if (err.code !== 409) throw err;
    }
  }
}

export default AppwriteService;
