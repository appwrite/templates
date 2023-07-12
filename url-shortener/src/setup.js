import AppwriteService from './appwrite'

async function setup() {
  console.log('Executing setup script...')

  const appwrite = AppwriteService()

  if (await appwrite.doesURLEntryDatabaseExist()) {
    console.log(`Database exists.`)
    return
  }

  await appwrite.setupURLEntryDatabase()
  console.log(`Database created.`)
}

setup()
