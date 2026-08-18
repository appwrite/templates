import 'dart:async';
import 'dart:typed_data';
import 'package:generate_pdf/pdf.dart';
import 'fake_order.dart';

Future<dynamic> main(final context) async {
  final pdf = PDF();
  final order = FakeOrder();
  var fakeOrder = order.createFakeOrder();
  context.log(fakeOrder.toJson().toString());
  final Uint8List? bytes = await pdf.createAndSave(fakeOrder);

  if (bytes != null) {
    context.log('PDF created.');
    context.log(bytes);

    return context.res.send(bytes, 200, {'Content-Type': 'application/pdf'});
  }

  return context.error("Someting gone wrong");
}
