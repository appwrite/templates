import { PDFDocument } from 'pdf-lib';
import { Buffer } from 'node:buffer';

export async function createPdf({ id, date, name, items, total }) {
  const document = await PDFDocument.create();
  const page = document.addPage([595.28, 841.89]); // A4 size

  page.drawText('Sample Invoice', { x: 50, y: 750, size: 20 });
  page.drawText(new Date(date).toLocaleDateString(), {
    x: 400,
    y: 750,
    size: 15,
  });

  page.drawText(`Hello, ${name}!`, {
    x: 50,
    y: 700,
    size: 30,
  });

  page.drawText(`Order ID: ${id}`, {
    x: 50,
    y: 650,
    size: 10,
  });

  page.drawText(`Total: $${total}`, { x: 50, y: 600, size: 15 });

  const orderList = items
    .map(
      ({ description, quantity, cost }) =>
        `${description} x ${quantity} = $${cost}`
    )
    .join('\n');

  page.drawText(orderList, { x: 50, y: 550, size: 15 });

  const pdfBytes = await document.save();

  return Buffer.from(pdfBytes);
}
