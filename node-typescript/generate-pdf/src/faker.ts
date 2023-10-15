import faker from 'faker';
import { FakeOrder, FakeOrderItem } from './interfaces';

export function generateFakeOrder(): FakeOrder {
  const items = Array.from(
    { length: faker.random.number({ min: 1, max: 5 }) },
    () => ({
      description: faker.commerce.productName(),
      quantity: faker.random.number({ min: 1, max: 10 }),
      cost: faker.commerce.price(),
    })
  );

  return {
    id: faker.random.uuid(),
    date: faker.date.past(),
    name: faker.name.findName(),
    items,
    total: items.reduce((acc, { cost }) => acc + parseFloat(cost), 0),
  };
}
