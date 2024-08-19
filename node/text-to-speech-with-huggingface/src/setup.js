import AppwriteService from './appwrite.js';
import { throwIfMissing } from './utils.js';

async function setup() {
  console.log('Executing setup script...');

  const bucketId = process.env.APPWRITE_BUCKET_ID ?? 'generated_speech';

  const appwrite = new AppwriteService(process.env.APPWRITE_FUNCTION_API_KEY);

  if (await appwrite.doesGeneratedSpeechBucketExist(bucketId)) {
    console.log(`Bucket exists.`);
  } else {
    await appwrite.setupGeneratedSpeechBucket(bucketId);
    console.log(`Bucket created.`);
  }
}

setup();
