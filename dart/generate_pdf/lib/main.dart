import 'dart:convert';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as shelf_io; //for testing locally
import './pdf.dart';
import './faker.dart';

Future<Response> pdfHandler(Request request) async {
  final fakeOrder = generateFakeOrder();
  print(
      'Generated fake order: ${JsonEncoder.withIndent('  ').convert(fakeOrder)}');

  final pdfBuffer = await createPDF(fakeOrder);
  print('PDF created');

  return Response.ok(pdfBuffer, headers: {'Content-Type': 'application/pdf'});
}

//For testing locally
void main() async {
  final handler = const Pipeline().addHandler(pdfHandler);
  final server = await shelf_io.serve(handler, 'localhost', 8080);
  print('Serving at http://${server.address.host}:${server.port}');
}
