import dotenv from 'dotenv';
import AppwriteService from './appwrite.js';

dotenv.config();

async function setup() {

  const bucketId = process.env.APPWRITE_BUCKET_ID ?? 'Generated_Images';
  // …
  const appwrite = new AppwriteService(process.env.APPWRITE_FUNCTION_API_KEY);

  if (await appwrite.doesGeneratedImageBucketExist(bucketId)) {
    console.log(`Bucket exists.`);
  } else {
    await appwrite.setupGeneratedImageBucket(bucketId);
    console.log(`Bucket created.`);
  }
}

setup();
