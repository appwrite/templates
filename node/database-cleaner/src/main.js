import AppwriteService from './appwrite.js';

export default async ({ req, res, log, error }) => {
  const appwrite = new AppwriteService();

  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const collectionId = process.env.APPWRITE_COLLECTION_ID;

  try {
    const cleanedCount = await appwrite.cleanCollection(
      databaseId,
      collectionId
    );

    log(`${cleanedCount} documents cleaned.`);
  } catch (err) {
    error(err.message);
  }

  return res.empty();
};
