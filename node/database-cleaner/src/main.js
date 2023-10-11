import AppwriteService from './appwrite.js';

export default async ({ req, res, log, error }) => {
  const appwrite = new AppwriteService();

  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const collectionId = process.env.APPWRITE_COLLECTION_ID;

  const cleanedCount = await appwrite.cleanCollection(databaseId, collectionId);

  return res.json({
    cleanedCount: cleanedCount,
  });
};
