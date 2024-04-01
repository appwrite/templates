import AppwriteService from './appwrite.js';
import { throwIfMissing } from './utils.js';
import 'dotenv/config';

async function setup() {
  throwIfMissing(process.env, ['APPWRITE_API_KEY']);

  const databaseId = process.env.APPWRITE_DATABASE_ID ?? 'ai';
  const collectionId = process.env.APPWRITE_COLLECTION_ID ?? 'speech_recognition';
  const bucketId = process.env.APPWRITE_BUCKET_ID ?? 'speech_recognition';

  console.log('Executing setup script...');

  const appwrite = new AppwriteService();

  if (await appwrite.doesAIDataExist(databaseId, collectionId)) {
    console.log(`Database exists.`);
  } else {
    await appwrite.setupAIDatabase(databaseId, collectionId);
    console.log(`Database created.`);
  }

  if (await appwrite.doesBucketExist(bucketId)) {
    console.log(`Bucket exists.`);
  } else {
    await appwrite.setupAIBucket(bucketId);
    console.log(`Bucket created.`);
  }
}

setup();
