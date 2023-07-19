import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const staticFolder = path.join(__dirname, '../static')

export default async ({ req, res, log, error }) => {
  log('Hello, Logs! 👋')
  error('Hello, Errors! 👋')

  if (req.method === 'GET') {
    const html = fs
      .readFileSync(path.join(staticFolder, 'index.html'))
      .toString()
    return res.send(html, 200, { 'Content-Type': 'text/html; charset=utf-8' })
  }

  return res.json({
    message: 'Hello, World! 👋',
  })
}
