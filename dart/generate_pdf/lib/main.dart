import 'dart:convert';
import './pdf.dart';
import './faker.dart';

Future<List<int>> pdfHandler() async {
  final fakeOrder = generateFakeOrder();
  print(
      'Generated fake order: ${JsonEncoder.withIndent('  ').convert(fakeOrder)}');

  final pdfBuffer = await createPDF(fakeOrder);
  print('PDF created');

  return pdfBuffer;
}

Future main(final context) async {
  try {
    final pdfBuffer = await pdfHandler();
    return context.res
        .binary(pdfBuffer, 200, {'Content-Type': 'application/pdf'});
  } catch (e) {
    context.error('Error occurred while generating PDF: $e');
    return context.res.text('Error occurred while generating PDF: $e', 500);
  }
}
