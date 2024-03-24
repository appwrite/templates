import Replicate from "replicate";
import { getStaticFile, throwIfMissing } from './utils.js';

export default async ({ req, res, error }) => {
  throwIfMissing(process.env, ['REPLICATE_API_TOKEN']);

  if (req.method === 'GET') {
    return res.send(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
  }

  const models = {
    'audio': 'meta/musicgen:b05b1dff1d8c6dc63d14b0cdb42135378dcb87f6373b0d3d341ede46e59e2b38',
    'text': 'meta/llama-2-70b-chat',
    'image': 'playgroundai/playground-v2.5-1024px-aesthetic:a45f82a1382bed5c7aeb861dac7c7d191b0fdf74d8d57c4a0e6ed7d4d0bf7d24'
  };

  try {
    throwIfMissing(req.body, ['prompt', 'type']);
  } catch (err) {
    return res.json({ ok: false, error: err.message }, 400);
  }

  const replicate = new Replicate();

  if (req.body.type !== 'audio' && req.body.type !== 'text' && req.body.type !== 'image') {
    return res.json({ ok: false, error: 'Invalid type' }, 400);
  }

  let request = {
    input: {
      prompt: req.body.prompt,
    }
  };

  // Allows you to tinker parameters for individual output types
  switch (req.body.type) {
    case 'audio': 
      request.input = {
        ...request.input,
        length: 30,
      }
    break;
    case 'text':
      request.input = {
        ...request.input,
        max_new_tokens: 512,
      }
    break;
    case 'image':
      request.input = {
        ...request.input,
        width: 512,
        height: 512,
        negative_prompt: "ugly, deformed, noisy, blurry, distorted",
      }
    break;
  };

  let response;

  try {
    response = await replicate.run(models[req.body.type], request);
  } catch (err) {
    error(err);

    return res.json({ ok: false, error: 'Failed to run model' }, 500);
  }

  if (req.body.type === 'image') {
    response = response[0]
  } else if (req.body.type === 'text') {
    response = response.join('');
  }

  return res.json({ ok: true, response, type: req.body.type }, 200);
};
