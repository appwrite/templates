import AppwriteService from './appwrite.js';
import { throwIfMissing } from './utils.js'

export default async ({ req, res, log, error }) => {
  throwIfMissing(process.env, [
    'APPWRITE_DATABASE_ID',
    'APPWRITE_API_KEY',
    'RETENTION_PERIOD_DAYS'
  ]);

  const appwrite = new AppwriteService();

  const collections = await this.listAllCollections(process.env.APPWRITE_DATABASE_ID);

  for (const collection of collections) {
    await this.cleanCollection(process.env.APPWRITE_DATABASE_ID, collection.$id);
  }

  log('Cleaning finished!')

  return res.empty();
};
