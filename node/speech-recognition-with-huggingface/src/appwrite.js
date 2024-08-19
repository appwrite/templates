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
   * @param {string} audioId
   * @param {object} labels
   * @returns {Promise<void>}
   */
  async createRecognitionEntry(databaseId, collectionId, audioId, speech) {
    await this.databases.createDocument(databaseId, collectionId, ID.unique(), {
      audio: audioId,
      speech: speech,
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
        'Speech Recognition'
      );
    } catch (err) {
      if (err.code !== 409) throw err;
    }

    try {
      await this.databases.createStringAttribute(
        databaseId,
        collectionId,
        'audio',
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
        'speech',
        10000,
        false
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
