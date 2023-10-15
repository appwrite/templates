interface FakeOrderItem {
    description: string;
    quantity: number;
    cost: string;
  }
  
interface FakeOrder {
    id: string;
    date: Date;
    name: string;
    items: FakeOrderItem[];
    total: number;
  }

export {FakeOrderItem,FakeOrder};