import { Client, Databases, ID, InputFile, Storage } from 'node-appwrite';

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
   * @param {string} bucketId
   * @param {Blob} blob
   */
  async createFile(bucketId, blob) {
    const file = await InputFile.fromBlob(blob, 'music.wav');
    return await this.storage.createFile(bucketId, ID.unique(), file);
  }

  /**
   * @param {string} bucketId
   * @returns {Promise<boolean>}
   */
  async doesGeneratedMusicBucketExist(bucketId) {
    try {
      await this.storage.getBucket(bucketId);
      return true;
    } catch (err) {
      if (err.code === 404) return false;
      throw err;
    }
  }

  async setupGeneratedMusicBucket(bucketId) {
    try {
      await this.storage.createBucket(bucketId, 'Generated music');
    } catch (err) {
      if (err.code !== 409) throw err;
    }
  }
}

export default AppwriteService;
