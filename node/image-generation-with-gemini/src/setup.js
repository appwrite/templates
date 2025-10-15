import dotenv from 'dotenv';
import AppwriteService from './appwrite.js';

dotenv.config();

/**
 * Ensures an Appwrite bucket for generated images exists, creating it if necessary.
 *
 * Reads APPWRITE_FUNCTION_API_KEY from environment and uses APPWRITE_BUCKET_ID (defaulting to "Generated_Images")
 * as the target bucket name. If the API key is missing the function throws an error; any failure is logged
 * and causes the process to exit with code 1.
 */
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