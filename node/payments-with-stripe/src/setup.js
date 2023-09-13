import AppwriteService from './appwrite.js';
import { throwIfMissing } from './utils.js';

async function setup() {
  throwIfMissing(process.env, ['APPWRITE_API_KEY']);

  const databaseId = process.env.APPWRITE_DATABASE_ID ?? 'orders';
  const collectionId = process.env.APPWRITE_COLLECTION_ID ?? 'orders';

  console.log('Executing setup script...');

  const appwrite = new AppwriteService();

  if (await appwrite.doesOrdersDatabaseExist(databaseId)) {
    console.log(`Database exists.`);
    return;
  }

  await appwrite.setupOrdersDatabase(databaseId, collectionId);
  console.log(`Database created.`);
}

setup();
