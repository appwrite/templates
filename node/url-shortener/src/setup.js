import AppwriteService from './appwrite.js';
import { throwIfMissing } from './utils.js';

async function setup() {
  throwIfMissing(process.env, [
    'APPWRITE_API_KEY',
    'APPWRITE_DATABASE_ID',
    'APPWRITE_COLLECTION_ID',
  ]);

  console.log('Executing setup script...');

  const appwrite = new AppwriteService();

  if (await appwrite.doesURLEntryDatabaseExist()) {
    console.log(`Database exists.`);
    return;
  }

  await appwrite.setupURLEntryDatabase();
  console.log(`Database created.`);
}

setup();
