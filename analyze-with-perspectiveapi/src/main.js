import fs from 'node:fs'
import path from 'node:path'
import { fetch } from 'undici'

export default async ({ req, res }) => {
  const { PERSPECTIVE_API_KEY } = process.env

  if (!PERSPECTIVE_API_KEY) {
    throw new Error('Function is missing required environment variables.')
  }

  if (req.method === 'GET') {
    let html = fs
      .readFileSync(path.join(__dirname, '../static/index.html'))
      .toString()

    return res.send(html, 200, { 'Content-Type': 'text/html; charset=utf-8' })
  }

  if (!req.bodyString) {
    return res.send('Missing body with a prompt.', 400)
  }

  const response = await fetch(
    `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${PERSPECTIVE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: {
          text: req.bodyString,
          type: 'PLAIN_TEXT',
        },
        languages: ['en'],
        requestedAttributes: {
          TOXICITY: {},
        },
      }),
    }
  )

  if (response.status !== 200) {
    return res.send('Error analyzing text.', 500)
  }

  const data = /** @type {*} */ (await response.json())
  return res.send(data.attributeScores.TOXICITY.summaryScore.value)
}
