import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const staticFolder = path.join(__dirname, '../static')

export default async ({ req, res, log }) => {
  log('Hello, World! 👋')

  if (req.method === 'GET') {
    let html = readFileSync(path.join(staticFolder, 'index.html')).toString()

    return res.send(html, 200, { 'Content-Type': 'text/html; charset=utf-8' })
  }

  return res.json({
    message: 'Hello, World! 👋',
  })
}
