import Replicate from 'replicate';
import { getStaticFile, throwIfMissing } from './utils.js';

export default async ({ req, res, error }) => {
  throwIfMissing(process.env, ['REPLICATE_API_TOKEN']);

  if (req.method === 'GET') {
    return res.text(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
  }

  const models = {
    audio:
      'meta/musicgen:b05b1dff1d8c6dc63d14b0cdb42135378dcb87f6373b0d3d341ede46e59e2b38',
    text: 'meta/llama-2-70b-chat',
    image:
      'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
  };

  if (!req.bodyJson.prompt || typeof req.bodyJson.prompt !== 'string') {
    return res.json(
      { ok: false, error: 'Missing required field `prompt`' },
      400
    );
  }

  if (
    req.bodyJson.type !== 'audio' &&
    req.bodyJson.type !== 'text' &&
    req.bodyJson.type !== 'image'
  ) {
    return res.json({ ok: false, error: 'Invalid field `type`' }, 400);
  }

  const replicate = new Replicate();

  let request = {
    input: {
      prompt: req.bodyJson.prompt,
    },
  };

  // Allows you to tinker parameters for individual output types
  switch (req.bodyJson.type) {
    case 'audio':
      request.input = {
        ...request.input,
        length: 30,
      };
      break;
    case 'text':
      request.input = {
        ...request.input,
        max_new_tokens: 512,
      };
      break;
    case 'image':
      request.input = {
        ...request.input,
        width: 512,
        height: 512,
        negative_prompt: 'deformed, noisy, blurry, distorted',
      };
      break;
  }

  let response;

  try {
    response = await replicate.run(models[req.bodyJson.type], request);
  } catch (err) {
    error(err);

    return res.json({ ok: false, error: 'Failed to run model' }, 500);
  }

  if (req.bodyJson.type === 'image') {
    response = response[0];
  } else if (req.bodyJson.type === 'text') {
    response = response.join('');
  }

  return res.json({ ok: true, response, type: req.bodyJson.type }, 200);
};
