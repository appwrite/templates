import 'dart:typed_data';
import 'package:pdf/widgets.dart';
import 'models/models.dart';

class PDF {
  late Document pdf;
  PDF() : pdf = Document();

  Future<Uint8List?> createAndSave(Order order) async {
    try {
      pdf.addPage(
        Page(
          build: (Context context) => Column(
            children: [
              Row(children: [
                Text("Invoice"),
                SizedBox(width: 100),
                Text(order.id)
              ]),
              ...order.items
                  .map((e) => Row(children: [
                        Text(e.id),
                        SizedBox(width: 50),
                        Text(e.name),
                        SizedBox(width: 50),
                        Text(e.price.toString()),
                      ]))
                  .toList()
            ],
          ),
        ),
      );
      return await _save(order.id);
    } catch (e) {
      return null;
    }
  }

  Future<Uint8List> _save(String name) async {
    var x = await pdf.save();
    return x;
  }
}
