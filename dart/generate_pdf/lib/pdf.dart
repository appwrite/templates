import 'dart:typed_data';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;

Future<Uint8List> createPDF(order) async {
  final pdf = pw.Document();
  final date = DateTime.parse(order['date']);

  final String orderList = (order['items'] as List)
      .map((item) =>
          '${item['description']} x ${item['quantity']} = \$${item['cost']}')
      .join('\n');

  pdf.addPage(pw.Page(
      pageFormat: PdfPageFormat.a4,
      margin: pw.EdgeInsets.only(left: 50),
      build: (pw.Context context) {
        return pw.Stack(children: [
          // Invoice title
          pw.Positioned(
              bottom: 750,
              child:
                  pw.Text('Sample Invoice', style: pw.TextStyle(fontSize: 20))),

          // Order date
          pw.Positioned(
              left: 350,
              bottom: 750,
              child: pw.Text('${date.month}/${date.day}/${date.year}',
                  style: pw.TextStyle(fontSize: 15))),

          // Name
          pw.Positioned(
              bottom: 700,
              child: pw.Text('Hello, ${order['name']}!',
                  style: pw.TextStyle(fontSize: 30))),

          // Order ID
          pw.Positioned(
              bottom: 650,
              child: pw.Text('Order ID: ${order['id']}',
                  style: pw.TextStyle(fontSize: 10))),

          // Order total
          pw.Positioned(
              bottom: 600,
              child: pw.Text('Total: \$${order['total'].toStringAsFixed(2)}',
                  style: pw.TextStyle(fontSize: 15))),

          // Order item list
          pw.Positioned(
              top: 841.89 - 565,
              child: pw.Text(orderList,
                  style: pw.TextStyle(fontSize: 15, lineSpacing: 8))),
        ]);
      }));

  final Uint8List pdfBytes = await pdf.save();

  return Uint8List.fromList(pdfBytes);
}
