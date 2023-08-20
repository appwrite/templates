import { faker } from '@faker-js/faker';

export function generateFakeOrder() {
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
