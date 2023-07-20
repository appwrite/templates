import AppwriteService from './appwrite.js';
import EnvironmentService from './environment.js';

async function setup() {
  console.log('Executing setup script...');

  const env = new EnvironmentService();
  const appwrite = new AppwriteService(env);

  if (await appwrite.doesURLEntryDatabaseExist()) {
    console.log(`Database exists.`);
    return;
  }

  await appwrite.setupURLEntryDatabase();
  console.log(`Database created.`);
}

setup();
