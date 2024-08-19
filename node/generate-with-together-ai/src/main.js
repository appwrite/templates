import { Client, ID, InputFile, Storage } from 'node-appwrite';
import { getStaticFile, throwIfMissing } from './utils.js';
import { fetch } from 'undici';

export default async ({ req, res, error }) => {
  throwIfMissing(process.env, [
    'TOGETHER_API_KEY',
    'APPWRITE_FUNCTION_PROJECT_ID',
    'APPWRITE_BUCKET_ID',
  ]);

  if (req.method === 'GET') {
    return res.text(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
  }

  const models = {
    text: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    image: 'stabilityai/stable-diffusion-xl-base-1.0',
  };

  if (!req.bodyJson.prompt || typeof req.bodyJson.prompt !== 'string') {
    return res.json(
      { ok: false, error: 'Missing required field `prompt`' },
      400
    );
  }

  if (req.bodyJson.type !== 'text' && req.bodyJson.type !== 'image') {
    return res.json({ ok: false, error: 'Invalid field `type`' }, 400);
  }

  let request = {
    model: models[req.bodyJson.type],
  };

  switch (req.bodyJson.type) {
    case 'text':
      request = {
        ...request,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant',
          },
          {
            role: 'user',
            content: req.bodyJson.prompt,
          },
        ],
        max_tokens: 512,
        repetition_penalty: 1,
      };
      break;
    case 'image':
      request = {
        ...request,
        prompt: req.bodyJson.prompt,
        width: 512,
        height: 512,
        steps: 20,
        results: 1,
        negative_prompt: 'deformed, noisy, blurry, distorted',
      };
      break;
  }

  let response;
  let url = 'https://api.together.xyz/v1/completions';

  if (req.bodyJson.type === 'text') {
    url = 'https://api.together.xyz/v1/chat/completions';
  }

  try {
    response = await fetch(url, {
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
      },
      method: 'POST',
      body: JSON.stringify(request),
    });
  } catch (err) {
    error(err);
    return res.json({ ok: false, error: 'Failed to run model' }, 500);
  }

  let resJson = await response.json();

  // Upload image to Appwrite Storage and return URL
  if (req.bodyJson.type === 'image') {
    const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(req.headers['x-appwrite-key']);

    const storage = new Storage(client);

    let data = Buffer.from(resJson.choices[0].image_base64, 'base64');

    let file = await storage.createFile(
      process.env.APPWRITE_BUCKET_ID,
      ID.unique(),
      InputFile.fromBuffer(data, 'image.png')
    );

    return res.json({
      ok: true,
      type: req.bodyJson.type,
      response: `${endpoint}/storage/buckets/${process.env.APPWRITE_BUCKET_ID}/files/${file['$id']}/view?project=${process.env.APPWRITE_FUNCTION_PROJECT_ID}`,
    });
  }

  return res.json(
    {
      ok: true,
      type: req.bodyJson.type,
      response: resJson.choices[0].message.content,
    },
    200
  );
};
