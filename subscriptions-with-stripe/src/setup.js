const AppwriteService = require("./appwrite");

async function setup() {
  console.log("Executing setup script...");

  const appwrite = AppwriteService();

  if (await appwrite.doesSubscribersDatabaseExist()) {
    console.log(`Database exists.`);
    return;
  }

  await appwrite.setupSubscribersDatabase();
  console.log(`Database created.`);
}

setup();
