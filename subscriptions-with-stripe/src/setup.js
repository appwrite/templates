const AppwriteService = require('./appwrite')

/**
 * Setup script for the subscribers database.
 * If the database already exists, this script will do nothing.
 */
async function setup() {
  console.log('Executing setup script...')

  const appwrite = AppwriteService()

  if (await appwrite.doesSubscribersDatabaseExist()) {
    console.log(`Database exists.`)
    return
  }

  await appwrite.setupSubscribersDatabase()
  console.log(`Database created.`)
}

setup()
