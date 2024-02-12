import { Client, Storage } from 'node-appwrite';
import { HfInference } from '@huggingface/inference'

export default async ({ req, res, log, error }) => {
  if (req.method !== 'POST') {
    return res.send('Method Not Allowed', 405)
  }

  if (!req.body.image) {
    return res.send('Bad Request', 400);
  }

  throwIfMissing(process.env, [
    'HF_API_KEY',
    'APPWRITE_BUCKET_ID',
    'APPWRITE_API_KEY',
  ]);

  const client = new Client();
  client
    .setEndpoint(
      process.env.APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1'
    )
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const storage = new Storage(client);

  let file;
  try {
    file = await storage.getFileDownload(process.env.STORAGE_BUCKET_ID, req.body.image);
  } catch (err) {
    if (err.code === 404) {
      return res.send('File Not Found', 404)
    }

    error(err);
    return res.send('Bad Request', 400);
  }

  const hf = new HfInference(process.env.HF_API_KEY)

  const result = await hf.imageClassification({
    data: file,
    model: 'microsoft/resnet-50'
  })

  return res.json(result);
};
