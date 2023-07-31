import AppwriteService from './appwrite.js';

async function setup() {
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
