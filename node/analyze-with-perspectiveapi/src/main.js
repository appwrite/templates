import { fetch } from 'undici';
import { getStaticFile, throwIfMissing } from './utils.js';

export default async ({ req, res }) => {
  throwIfMissing(process.env, ['PERSPECTIVE_API_KEY']);

  if (req.method === 'GET') {
    return res.text(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
  }

  if (!req.bodyJson.text || typeof req.bodyJson.text !== 'string') {
    return res.json({ ok: false, error: 'Missing required field `text`' }, 400);
  }

  const response = await fetch(
    `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${process.env.PERSPECTIVE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: {
          text: req.bodyJson.text,
          type: 'PLAIN_TEXT',
        },
        languages: ['en'],
        requestedAttributes: {
          TOXICITY: {},
        },
      }),
    }
  );

  if (response.status !== 200) {
    return res.json(
      { ok: false, error: 'Error fetching from perspective API' },
      500
    );
  }

  const data = /** @type {*} */ (await response.json());
  const score = data.attributeScores.TOXICITY.summaryScore.value;
  if (!score) {
    return res.json(
      { ok: false, error: 'Error fetching from perspective API' },
      500
    );
  }

  return res.json({ ok: true, score });
};
