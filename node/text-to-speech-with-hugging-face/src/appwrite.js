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
  * @param {string} fileId
  * @param {Blob} file
  */
  async createFile(bucketId, fileId, file)
  {
    let parsedFile = await InputFile.fromBlob(file, 'audio.flac')

    return await this.storage.createFile(
      bucketId,
      fileId,
      parsedFile
    )
  }

  /**
  *
  */
  async updateOrCreateTTSEntry(
    databaseId,
    collectionId,
    documentId,
    fileId,
    text
  )
  {
    const data = {
      text,
      tts: fileId,
    };

    if (documentId === ID.unique()) {
      return await this.databases.createDocument(
        databaseId,
        collectionId,
        documentId,
        data
      );
    }

    try {
      return await this.databases.updateDocument(
        databaseId,
        collectionId,
        documentId,
        data
      );
    } catch (err) {
      if (err.code === 404) {
        return await this.databases.createDocument(
          databaseId,
          collectionId,
          documentId,
          data
        );
      } else {
        throw err;
      }
    }
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
      await this.databases.createCollection(databaseId, collectionId, 'TTS');
    } catch (err) {
      if (err.code !== 409) throw err;
    }

    try {
      await this.databases.createStringAttribute(
        databaseId,
        collectionId,
        'text',
        4028,
        true
      );
    } catch (err) {
      if (err.code !== 409) throw err;
    }

    try {
      await this.databases.createStringAttribute(
        databaseId,
        collectionId,
        'tts',
        1024,
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
