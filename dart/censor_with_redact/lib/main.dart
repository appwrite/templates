import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'utils.dart';

Future<dynamic> main(final context) async {
  throwIfMissing(Platform.environment, ['PANGEA_REDACT_TOKEN']);

  if (context.req.method == 'GET') {
    return context.res.text(getStaticFile('index.html'), 200,
        {'Content-Type': 'text/html; charset=utf-8'});
  }

  try {
    throwIfMissing(context.req.body, ['text']);
  } catch (err) {
    return context.res.json({'ok': false, 'error': err.toString()});
  }

  final response =
      await http.post(Uri.parse('https://redact.aws.eu.pangea.cloud/v1/redact'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization':
                'Bearer ${Platform.environment['PANGEA_REDACT_TOKEN']}',
          },
          body: jsonEncode({
            'text': context.req.body['text'],
          }));

  final data = jsonDecode(response.body);

  return context.res
      .json({'ok': true, 'redacted': data['result']['redacted_text']});
}
