import { getStaticFile, throwIfMissing } from './utils.js';

export default async ({ req, res, error }) => {
  throwIfMissing(process.env, ['MODAL_TOKEN']);

  if (req.method === 'GET') {
    return res.send(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
  }

  if (!req.body.prompt || typeof req.body.prompt !== 'string') {
    return res.json(
      { ok: false, error: 'Missing required field `prompt`' },
      400
    );
  }

  const body = JSON.stringify({
    prompt: req.body.prompt,
    height: 768,
    width: 768,
    num_outputs: 1,
  });

  const response = await fetch(
    'https://modal-labs--instant-stable-diffusion-xl.modal.run/v1/inference',
    {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.MODAL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body,
    }
  );

  if (response.status !== 201) {
    const message = await response.text();
    return res.json(
      { ok: false, error: `Failed to generate image: ${message}` },
      500
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');

  return res.json({
    ok: true,
    src: `data:image/png;base64,${base64}`,
  });
};
