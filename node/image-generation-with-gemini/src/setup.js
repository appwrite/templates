import AppwriteService from './appwrite.js';


async function setup() {

  const bucketId = process.env.APPWRITE_BUCKET_ID ?? 'Generated_Images';

  const appwrite = new AppwriteService(process.env.APPWRITE_FUNCTION_API_KEY);

  if (await appwrite.doesGeneratedImageBucketExist(bucketId)) {
    console.log(`Bucket exists.`);
  } else {
    await appwrite.setupGeneratedImageBucket(bucketId);
    console.log(`Bucket created.`);
  }
}

setup();
