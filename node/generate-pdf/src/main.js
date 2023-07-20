import { PDFDocument } from 'pdf-lib';
import { faker } from '@faker-js/faker';

export default async ({ res, log }) => {
  const fakeOrder = generateFakeOrder();
  log(`Generated fake order: ${JSON.stringify(fakeOrder, null, 2)}`);

  const pdfBuffer = await createPdf(fakeOrder);
  log('PDF created.');

  return res.send(pdfBuffer, 200, { 'Content-Type': 'application/pdf' });
};

function generateFakeOrder() {
  const items = Array.from(
    { length: faker.number.int({ min: 1, max: 5 }) },
    () => ({
      description: faker.commerce.productName(),
      quantity: faker.number.int({ min: 1, max: 10 }),
      cost: faker.commerce.price(),
    })
  );

  return {
    id: faker.string.uuid(),
    date: faker.date.past(),
    name: faker.person.fullName(),
    items,
    total: items.reduce((acc, { cost }) => acc + parseFloat(cost), 0),
  };
}

async function createPdf({ id, date, name, items, total }) {
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

  return Buffer.from(pdfBytes.buffer);
}
