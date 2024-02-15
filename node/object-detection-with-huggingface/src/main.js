import { Client, Databases, ID, Storage } from 'node-appwrite';
import { HfInference } from '@huggingface/inference';
import { throwIfMissing } from './utils.js';

export default async ({ req, res, log, error }) => {
  throwIfMissing(process.env, [
    'HF_API_KEY',
    'APPWRITE_BUCKET_ID',
    'APPWRITE_DATABASE_ID',
    'APPWRITE_COLLECTION_ID',
    'APPWRITE_API_KEY',
  ]);

  if (req.method !== 'POST') {
    return res.send('Method Not Allowed', 405);
  }

  let fileId = req.body.$id || req.body.imageId;

  if (!fileId) {
    error('Missing fileId');
    return res.send('Bad Request', 400);
  }

  if (
    req.body.bucketId &&
    req.body.bucketId != process.env.APPWRITE_BUCKET_ID
  ) {
    error('Invalid bucketId');
    return res.send('Bad Request', 400);
  }

  const client = new Client();
  client
    .setEndpoint(
      process.env.APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1'
    )
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const storage = new Storage(client);
  const database = new Databases(client);

  let file;
  try {
    file = await storage.getFileDownload(
      process.env.APPWRITE_BUCKET_ID,
      fileId
    );
  } catch (err) {
    if (err.code === 404) {
      error(err);
      return res.send('File Not Found', 404);
    }

    error(err);
    return res.send('Bad Request', 400);
  }

  const hf = new HfInference(process.env.HF_API_KEY);

  const result = await hf.objectDetection({
    data: file,
    model: 'facebook/detr-resnet-50',
  });

  try {
    await database.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_ID,
      ID.unique(),
      {
        image: fileId,
        labels: JSON.stringify(result),
      }
    );
  } catch (err) {
    error(err);
    return res.send('Internal Server Error', 500);
  }

  log('Image ' + fileId + ' recognised ', result);
  return res.json(result);
};
