import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const staticFolder = path.join(__dirname, '../static')

export default async ({ req, res }) => {
  const { PANGEA_REDACT_TOKEN } = process.env

  if (!PANGEA_REDACT_TOKEN) {
    throw new Error('Function is missing required environment variables.')
  }

  if (req.method === 'GET') {
    const html = fs
      .readFileSync(path.join(staticFolder, 'index.html'))
      .toString()
    return res.send(html, 200, { 'Content-Type': 'text/html; charset=utf-8' })
  }

  if (!req.bodyString) {
    return res.send('Missing body with a prompt.', 400)
  }

  const response = await fetch(`https://redact.aws.eu.pangea.cloud/v1/redact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PANGEA_REDACT_TOKEN}`,
    },
    body: JSON.stringify({
      text: req.bodyString,
    }),
  })

  const data = /** @type {*} */ (await response.json())
  return res.send(data.result.redacted_text)
}
