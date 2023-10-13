import AppwriteService from './appwrite.js';

export default async ({ req, res, log, error }) => {
  const appwrite = new AppwriteService();

  const databaseId = process.env.APPWRITE_DATABASE_ID;

  try {
    await appwrite.cleanAllCollections(databaseId);
  } catch (err) {
    error(err.message);
  }

  return res.empty();
};
