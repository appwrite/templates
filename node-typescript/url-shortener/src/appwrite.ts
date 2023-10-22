import { Client, Databases,Models,AppwriteException } from 'node-appwrite';

type URLEntry = {url:string};

type URLEntryDocument = Models.Document & URLEntry;

class AppwriteService {
  databases: Databases;
  constructor() {
    const client = new Client();
    client
      .setEndpoint(
        process.env.APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1'
      )
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    this.databases = new Databases(client);
  }


  async getURLEntry(shortCode: string):Promise<URLEntryDocument | null> {
    try {
      const document:URLEntryDocument = await this.databases.getDocument(
          process.env.APPWRITE_DATABASE_ID,
          process.env.APPWRITE_COLLECTION_ID,
          shortCode
        );

      return document;
    } catch (err) {
      if (err instanceof AppwriteException && err.code !== 404) throw err;
      return null;
    }
  }

  async createURLEntry(
    url: string,
    shortCode: string
  ): Promise<URLEntryDocument | null> {
    try {
      const document = await this.databases.createDocument<URLEntryDocument>(
          process.env.APPWRITE_DATABASE_ID,
          process.env.APPWRITE_COLLECTION_ID,
          shortCode,
          {
            url,
          }
        );

      return document;
    } catch (err) {
      if (err instanceof AppwriteException &&  err.code !== 409) throw err;
      return null;
    }
  }

  /**
   * @returns {Promise<boolean>}
   */
  async doesURLEntryDatabaseExist() {
    try {
      await this.databases.get(process.env.APPWRITE_DATABASE_ID);
      return true;
    } catch (err) {
      if (err instanceof AppwriteException && err.code !== 404) throw err;
      return false;
    }
  }

  async setupURLEntryDatabase() {
    try {
      await this.databases.create(
        process.env.APPWRITE_DATABASE_ID,
        'URL Shortener'
      );
    } catch (err) {
      // If resource already exists, we can ignore the error
      if (err instanceof AppwriteException && err.code !== 409) throw err;
    }
    try {
      await this.databases.createCollection(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_COLLECTION_ID,
        'URLs'
      );
    } catch (err) {
      if (err instanceof AppwriteException &&  err.code !== 409) throw err;
    }
    try {
      await this.databases.createUrlAttribute(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_COLLECTION_ID,
        'url',
        true
      );
    } catch (err) {
      if (err instanceof AppwriteException && err.code !== 409) throw err;
    }
  }
}

export default AppwriteService;
