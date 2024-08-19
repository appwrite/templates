import { HfInference } from '@huggingface/inference';
import { throwIfMissing } from './utils.js';
import AppwriteService from './appwrite.js';

export default async ({ req, res, log, error }) => {
  throwIfMissing(process.env, ['HUGGINGFACE_ACCESS_TOKEN']);

  const databaseId = process.env.APPWRITE_DATABASE_ID ?? 'ai';
  const collectionId =
    process.env.APPWRITE_COLLECTION_ID ?? 'image_classification';
  const bucketId = process.env.APPWRITE_BUCKET_ID ?? 'image_classification';

  if (req.method !== 'POST') {
    return res.json({ ok: false, error: 'Method not allowed' }, 405);
  }

  const fileId = req.bodyJson.$id || req.bodyJson.imageId;
  if (!fileId) {
    error('Missing fileId');
    return res.json({ ok: false, error: 'Bad request' }, 400);
  }

  if (req.bodyJson.bucketId && req.bodyJson.bucketId != bucketId) {
    error('Invalid bucketId');
    return res.json({ ok: false, error: 'Bad request' }, 400);
  }

  const appwrite = new AppwriteService(req.headers['x-appwrite-key']);

  let file;
  try {
    file = await appwrite.getFile(bucketId, fileId);
  } catch (err) {
    if (err.code === 404) {
      error(err);
      return res.json({ ok: false, error: 'File not found' }, 404);
    }

    error(err);
    return res.json({ ok: false, error: 'Bad request' }, 400);
  }

  const hf = new HfInference(process.env.HUGGINGFACE_ACCESS_TOKEN);

  const result = await hf.imageClassification({
    data: file,
    model: 'microsoft/resnet-50',
  });

  try {
    await appwrite.createImageLabels(databaseId, collectionId, fileId, result);
  } catch (err) {
    error(err);
    return res.json({ ok: false, error: 'Failed to create image labels' }, 500);
  }

  log('Image ' + fileId + ' classified', result);
  return res.json(result);
};
