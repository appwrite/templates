import { Client, Databases, ID, Storage } from 'node-appwrite';

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
   * @param {string} databaseId
   * @param {string} collectionId
   * @param {string} imageId
   * @param {object} labels
   * @returns {Promise<void>}
   */
  async createImageLabels(databaseId, collectionId, imageId, labels) {
    await this.databases.createDocument(databaseId, collectionId, ID.unique(), {
      image: imageId,
      labels: JSON.stringify(labels),
    });
  }

  /**
   * @param {string} bucketId
   * @param {string} fileId
   * @returns {Promise<Buffer>}
   */
  async getFile(bucketId, fileId) {
    return await this.storage.getFileDownload(bucketId, fileId);
  }

  /**
   * @param {string} databaseId
   * @param {string} collectionId
   * @returns {Promise<boolean>}
   */
  async doesAIDataExist(databaseId, collectionId) {
    try {
      await this.databases.get(databaseId);
      await this.databases.getCollection(databaseId, collectionId);
      return true;
    } catch (err) {
      if (err.code === 404) return false;
      throw err;
    }
  }

  /**
   * @param {string} bucketId
   * @returns {Promise<boolean>}
   */
  async doesBucketExist(bucketId) {
    try {
      await this.storage.getBucket(bucketId);
      return true;
    } catch (err) {
      if (err.code === 404) return false;
      throw err;
    }
  }

  /**
   * @param {string} databaseId
   * @param {string} collectionId
   * @returns {Promise<void>}
   */
  async setupAIDatabase(databaseId, collectionId) {
    try {
      await this.databases.create(databaseId, 'AI Database');
    } catch (err) {
      if (err.code !== 409) throw err;
    }

    try {
      await this.databases.createCollection(
        databaseId,
        collectionId,
        'Image Labels'
      );
    } catch (err) {
      if (err.code !== 409) throw err;
    }

    try {
      await this.databases.createStringAttribute(
        databaseId,
        collectionId,
        'image',
        64,
        true
      );
    } catch (err) {
      if (err.code !== 409) throw err;
    }

    try {
      await this.databases.createStringAttribute(
        databaseId,
        collectionId,
        'labels',
        1024,
        true
      );
    } catch (err) {
      if (err.code !== 409) throw err;
    }
  }

  async setupAIBucket(bucketId) {
    try {
      await this.storage.createBucket(bucketId, 'AI');
    } catch (err) {
      if (err.code !== 409) throw err;
    }
  }
}

export default AppwriteService;
