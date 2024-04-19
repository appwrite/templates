import AppwriteService from './appwrite.js';
import { throwIfMissing } from './utils.js';

export default async ({ req, res, log, error }) => {
  throwIfMissing(process.env, [
    'APPWRITE_DATABASE_ID',
    'APPWRITE_COLLECTION_ID',
    'APPWRITE_API_KEY',
    'RETENTION_PERIOD_DAYS',
  ]);

  const appwrite = new AppwriteService();

  await appwrite.cleanCollection(
    process.env.APPWRITE_DATABASE_ID,
    process.env.APPWRITE_COLLECTION_ID
  );

  log('Cleaning finished!');

  return res.empty();
};
