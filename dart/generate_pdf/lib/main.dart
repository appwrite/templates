import 'dart:async';
import 'dart:io';
import 'package:dart_appwrite/dart_appwrite.dart';
import 'package:starter_template/faker_order.dart';
import 'package:starter_template/pdf.dart';

// This is your Appwrite function
// It's executed each time we get a request
Future<dynamic> main(final context) async {
  final pdf = PDF();
  final order = FakeOrder();
  var fakeOrder = order.createFakeOrder();
  print(fakeOrder.toJson().toString());
  final bytes = await pdf.createAndSave(fakeOrder);

  if (bytes != null) {
    print('PDF created.');
    print(bytes);

    return context.res.send(bytes, 200, {'Content-Type': 'application/pdf'});
  }

  return context.error();
}
