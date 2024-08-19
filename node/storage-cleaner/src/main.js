import AppwriteService from './appwrite.js';
import { throwIfMissing } from './util.js';

export default async ({ req, res, log, error }) => {
  throwIfMissing(process.env, [
    'RETENTION_PERIOD_DAYS',
    'APPWRITE_BUCKET_ID',
  ]);

  const appwrite = new AppwriteService(req.headers['x-appwrite-key']);

  await appwrite.cleanBucket(process.env.APPWRITE_BUCKET_ID);

  return res.text('Buckets cleaned', 200);
};
