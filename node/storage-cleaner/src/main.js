import AppwriteService from './appwrite.js';
import { throwIfMissing } from './util.js';

export default async ({ req, res, log, error }) => {
  throwIfMissing(process.env, [
    'APPWRITE_API_KEY',
    'RETENTION_PERIOD_DAYS',
    'APPWRITE_BUCKET_ID',
  ]);

  const appwrite = new AppwriteService();

  await appwrite.cleanBucket(process.env.APPWRITE_BUCKET_ID);

  return res.send('Buckets cleaned', 200);
};
