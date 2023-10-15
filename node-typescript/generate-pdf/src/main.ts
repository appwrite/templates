import { createPdf } from './pdf.js';
import { generateFakeOrder } from './faker.js';

export default async ({ res, log }) => {
  const fakeOrder = generateFakeOrder();
  log(`Generated fake order: ${JSON.stringify(fakeOrder, null, 2)}`);

  const pdfBuffer = await createPdf(fakeOrder);
  log('PDF created.');

  return res.send(pdfBuffer, 200, { 'Content-Type': 'application/pdf' });
};

