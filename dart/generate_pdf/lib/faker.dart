import 'package:faker_dart/faker_dart.dart';

Map<String, dynamic> generateFakeOrder() {
  final faker = Faker.instance;
  List<Map<String, dynamic>> items = List.generate(
      faker.datatype.number(min: 1, max: 5),
      (_) => {
            'description': faker.commerce.productName(),
            'quantity': faker.datatype.number(min: 1, max: 10),
            'cost': double.parse(faker.commerce.price(symbol: ''))
                .toStringAsFixed(2)
          });

  return {
    'id': faker.datatype.uuid(),
    'date': faker.date.past(DateTime.now(), rangeInYears: 25).toIso8601String(),
    'name': faker.name.fullName(),
    'items': items,
    'total': items.fold<num>(0, (sum, item) {
      return sum + double.parse(item['cost']);
    })
  };
}
