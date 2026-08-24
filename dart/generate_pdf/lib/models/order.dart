import 'item.dart';

class Order {
  String id;
  DateTime date;
  String name;
  List<Item> items;
  int total;

  Order({
    required this.id,
    required this.date,
    required this.name,
    required this.items,
    required this.total,
  });

  factory Order.fromJson(Map<String, dynamic> json) => Order(
        id: json["id"],
        date: json["date"],
        name: json["name"],
        items: List<Item>.from(json["items"].map((x) => x)),
        total: json["total"]?.toDouble(),
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "date": date,
        "name": name,
        "items": List<Item>.from(items.map((x) => x)),
        "total": total,
      };
}
