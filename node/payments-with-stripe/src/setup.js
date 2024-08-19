import AppwriteService from './appwrite.js';
import { throwIfMissing } from './utils.js';

async function setup() {
  const databaseId = process.env.APPWRITE_DATABASE_ID ?? 'orders';
  const collectionId = process.env.APPWRITE_COLLECTION_ID ?? 'orders';

  console.log('Executing setup script...');

  const appwrite = new AppwriteService(process.env.APPWRITE_FUNCTION_API_KEY);

  if (await appwrite.doesOrdersDatabaseExist(databaseId)) {
    console.log(`Database exists.`);
    return;
  }

  await appwrite.setupOrdersDatabase(databaseId, collectionId);
  console.log(`Database created.`);
}

setup();
