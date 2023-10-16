import AppwriteService from './appwrite.js';

export default async ({ req, res, log, error }) => {
  const appwrite = new AppwriteService();

  try {
    await appwrite.cleanAllBuckets();
  } catch (error) {
    error(err.message);
  }

  return res.send('Buckets cleaned', 200);
};
