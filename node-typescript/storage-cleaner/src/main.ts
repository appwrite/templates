import AppwriteService from './appwrite.js';
import { throwIfMissing } from './util.js';

type Context = {
  req: any;
  res: any;
  log: (msg: any) => void;
  error: (msg: any) => void;
};
export default async ({ req, res, log, error }: Context) => {
  throwIfMissing(process.env, ['RETENTION_PERIOD_DAYS', 'APPWRITE_BUCKET_ID']);

  const appwrite = new AppwriteService(req.headers['x-appwrite-key']);

  await appwrite.cleanBucket(process.env.APPWRITE_BUCKET_ID!);

  return res.text('Buckets cleaned', 200);
};
