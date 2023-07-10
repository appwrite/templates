const fs = require('fs')
const path = require('path')

const staticFolder = path.join(__dirname, '../static')

module.exports = async ({ req, res, log }) => {
    log('Hello, World!')

    if (req.method === 'GET') {
        let html = fs
            .readFileSync(path.join(staticFolder, 'index.html'))
            .toString()

        return res.send(html, 200, {
            'Content-Type': 'text/html; charset=utf-8',
        })
    }

    return res.json({
        message: 'Hello, World!',
    })
}
