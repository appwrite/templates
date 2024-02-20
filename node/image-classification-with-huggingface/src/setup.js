import { Client, Databases, Storage } from "node-appwrite";
import { throwIfMissing } from "./utils.js";
import 'dotenv/config'

console.log('Setting up database and storage');

throwIfMissing(process.env, [
  'APPWRITE_BUCKET_ID',
  'APPWRITE_DATABASE_ID',
  'APPWRITE_COLLECTION_ID',
  'APPWRITE_API_KEY',
  'APPWRITE_FUNCTION_PROJECT_ID'
]);

const client = new Client();
client
  .setEndpoint(
    process.env.APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1'
  )
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

setup(client);

async function setup(client) {
  const database = new Databases(client);
  try {
    await database.get(process.env.APPWRITE_DATABASE_ID);
  } catch (err) {
    if (err.code === 404) {
      console.log('Creating database');
      await database.create(
        process.env.APPWRITE_DATABASE_ID,
        'AI'
      );
    } else if (err.code === 409) {
      // Database already exists
    }

    throw err;
  }

  try {
    await database.getCollection(process.env.APPWRITE_DATABASE_ID, process.env.APPWRITE_COLLECTION_ID);
  } catch (err) {
    if (err.code === 404) {
      console.log('Creating collection and attributes');
      await database.createCollection(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_COLLECTION_ID,
        'Image Labels'
      );

      await database.createStringAttribute(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_COLLECTION_ID,
        'image',
        64,
        true
      );

      await database.createStringAttribute(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_COLLECTION_ID,
        'labels',
        1024,
        true
      );
    } else if (err.code === 409) {
      // Collection already exists
    }

    throw err;
  }

  // Storage
  const storage = new Storage(client);

  try {
    await storage.getBucket(process.env.APPWRITE_BUCKET_ID);
  } catch (err) {
    console.log('Creating bucket');
    if (err.code === 404) {
      await storage.createBucket(
        process.env.APPWRITE_BUCKET_ID,
        'Images'
      );
    } else if (err.code === 409) {
      // Bucket already exists
    }

    throw err;
  }

  console.log('Setup complete');
}
