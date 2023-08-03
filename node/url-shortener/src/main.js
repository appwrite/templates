import AppwriteService from './appwrite.js';
import { isValidURL, generateShortCode } from './utils.js';

export default async ({ res, req, log, error }) => {
  const appwrite = new AppwriteService();

  if (req.method === 'POST') {
    const { url } = req.body;

    if (!url || !isValidURL(url)) {
      error('Invalid url parameter.');
      return res.json({ ok: false, error: 'Invalid url parameter' }, 400);
    }

    const shortCode = generateShortCode();
    const urlEntry = await appwrite.createURLEntry(url, shortCode);

    if (!urlEntry) {
      error('Failed to create url entry.');
      return res.json({ ok: false, error: 'Failed to create url entry' }, 500);
    }

    return res.json(
      {
        url: `${req.host}/${urlEntry.$id}`
      }
    );
  }

  const shortId = req.path.replace(/^\/|\/$/g, '');
  log(`Fetching document from with ID: ${shortId}`);

  const urlEntry = await appwrite.getURLEntry(shortId);

  if (!urlEntry) {
    return res.send('Invalid link.', 404);
  }

  return res.redirect(urlEntry.url);
};
