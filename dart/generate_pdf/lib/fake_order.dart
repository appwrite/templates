import 'package:faker/faker.dart';
import 'models/models.dart';

class FakeOrder {
  final Faker _faker;
  FakeOrder() : _faker = Faker();

  List<Item> createFakeItems([items = 10]) {
    final List<Item> items = [];
    for (var i = 0; i < 10; i++) {
      final item = Item(
        id: _faker.guid.guid(),
        name: _faker.lorem.word(),
        price: _faker.currency.random.amount((i) => i, 10).first,
      );
      items.add(item);
    }
    return items;
  }

  Order createFakeOrder() {
    final items = createFakeItems();
    int totalPrice = 0;

    for (var item in items) {
      totalPrice = totalPrice + item.price;
    }

    final order = Order(
      id: _faker.guid.guid(),
      date: _faker.date.dateTime(),
      name: _faker.person.name(),
      items: createFakeItems(),
      total: totalPrice,
    );
    return order;
  }
}
