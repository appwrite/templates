import AppwriteService from './appwrite.js';
import { throwIfMissing } from './util.js';

export default async ({ req, res, log, error }) => {
  throwIfMissing(process.env, [
    'APPWRITE_FUNCTION_PROJECT_ID',
    'APPWRITE_API_KEY',
  ]);

  const appwrite = new AppwriteService();

  try {
    await appwrite.cleanAllBuckets();
  } catch (exception) {
    error(exception.message);
  }

  return res.send('Buckets cleaned', 200);
};
