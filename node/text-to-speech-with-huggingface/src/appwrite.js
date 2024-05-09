import { Client, Databases, ID, InputFile, Storage } from 'node-appwrite';

class AppwriteService {
  constructor() {
    const client = new Client();
    client
      .setEndpoint(
        process.env.APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1'
      )
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    this.databases = new Databases(client);
    this.storage = new Storage(client);
  }

  /**
   * @param {string} bucketId
   * @param {Blob} blob
   */
  async createFile(bucketId, blob) {
    const file = await InputFile.fromBlob(blob, 'audio.flac');
    return await this.storage.createFile(bucketId, ID.unique(), file);
  }

  /**
   * @param {string} bucketId
   * @returns {Promise<boolean>}
   */
  async doesGeneratedSpeechBucketExist(bucketId) {
    try {
      await this.storage.getBucket(bucketId);
      return true;
    } catch (err) {
      if (err.code === 404) return false;
      throw err;
    }
  }

  async setupGeneratedSpeechBucket(bucketId) {
    try {
      await this.storage.createBucket(bucketId, 'Generated speech');
    } catch (err) {
      if (err.code !== 409) throw err;
    }
  }
}

export default AppwriteService;
