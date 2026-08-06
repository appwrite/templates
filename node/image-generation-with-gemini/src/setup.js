import dotenv from 'dotenv';
import AppwriteService from './appwrite.js';

dotenv.config();

async function setup() {
  try {
    const apiKey = process.env.APPWRITE_FUNCTION_API_KEY;
    if (!apiKey) {
      throw new Error("APPWRITE_FUNCTION_API_KEY is not set in environment variables");
    }

    const bucketId = process.env.APPWRITE_BUCKET_ID ?? 'Generated_Images';

    const appwrite = new AppwriteService(apiKey);

    if (await appwrite.doesGeneratedImageBucketExist(bucketId)) {
      console.log(`Bucket exists.`);
    } else {
      await appwrite.setupGeneratedImageBucket(bucketId);
      console.log(`Bucket created.`);
    }
  } catch (error) {
    console.error("Setup failed:", error.message);
    process.exit(1);
  }
}

setup();
