import AppwriteService from './appwrite.js';
import { throwIfMissing } from './utils.js';

async function setup() {
  console.log('Executing setup script...');

  throwIfMissing(process.env, ['APPWRITE_API_KEY']);
  const bucketId = process.env.APPWRITE_BUCKET_ID ?? 'generated_music';

  const appwrite = new AppwriteService();

  if (await appwrite.doesGeneratedMusicBucketExist(bucketId)) {
    console.log(`Bucket exists.`);
  } else {
    await appwrite.setupGeneratedMusicBucket(bucketId);
    console.log(`Bucket created.`);
  }
}

setup();
