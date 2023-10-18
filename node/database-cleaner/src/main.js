import AppwriteService from './appwrite.js';

export default async ({ req, res, log, error }) => {
  const appwrite = new AppwriteService();

  throwIfMissing(process.env, [
    'APPWRITE_DATABASE_ID',
    'APPWRITE_API_KEY',
    'RETENTION_PERIOD_DAYS'
  ]);

  const databaseId = process.env.APPWRITE_DATABASE_ID;

  await appwrite.cleanAllCollections(databaseId);

  return res.send('Cleaning finished.', 200);
};
