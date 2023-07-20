import QRCode from 'qrcode';

export default async ({ req, res, log }) => {
  if (req.method !== 'GET' && req.path !== '/') {
    return res.send('Not found', 404);
  }

  const url = req.query.url ?? 'https://appwrite.io';

  const qrCodeBuffer = await createQrCode(url);
  log('QR Code created.');

  return res.send(qrCodeBuffer, 200, { 'Content-Type': 'image/png' });
};

/**
 *
 * @param {string} text
 * @returns
 */
async function createQrCode(text) {
  const qrCodeDataUrl = await QRCode.toDataURL(text);

  const base64Image = qrCodeDataUrl.split(';base64,').pop();
  if (!base64Image) {
    throw new Error('Could not create QR Code.');
  }

  const qrCodeBuffer = Buffer.from(base64Image, 'base64');
  return qrCodeBuffer;
}
