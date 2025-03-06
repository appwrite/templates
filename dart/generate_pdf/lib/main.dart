import 'dart:convert';
import 'package:shelf/shelf.dart';
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
