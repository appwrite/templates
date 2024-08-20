import AppwriteService from './appwrite.js';
import { throwIfMissing } from './utils.js';

async function setup() {
  console.log('Executing setup script...');

  const bucketId = process.env.APPWRITE_BUCKET_ID ?? 'generated_music';

  const appwrite = new AppwriteService(process.env.APPWRITE_FUNCTION_API_KEY);

  if (await appwrite.doesGeneratedMusicBucketExist(bucketId)) {
    console.log(`Bucket exists.`);
  } else {
    await appwrite.setupGeneratedMusicBucket(bucketId);
    console.log(`Bucket created.`);
  }
}

setup();
