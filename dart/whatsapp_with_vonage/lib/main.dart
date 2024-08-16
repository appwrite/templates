import 'dart:convert';
import 'dart:io';
import 'package:crypto/crypto.dart';
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';
import 'package:whatsapp_with_vonage/utils.dart';
import 'package:http/http.dart' as http;

Future<dynamic> main(final context) async {
  throwIfMissing(Platform.environment, [
    'VONAGE_API_KEY',
    'VONAGE_API_SECRET',
    'VONAGE_API_SIGNATURE_SECRET',
    'VONAGE_WHATSAPP_NUMBER'
  ]);

  if (context.req.method == 'GET') {
    return context.res.text(getStaticFile('index.html'), 200,
        {'Content-Type': 'text/html; charset=utf-8'});
  }

  final token = context.req.headers['authorization'].split(' ')[1];

  if (token == null) {
    return context.res.json({'ok': false, 'error': 'Unauthorized'}, 401);
  }

  if (context.req.body['from'] == null || context.req.body['text'] == null) {
    return context.res.json({'ok': false, 'error': 'Missing required fields.'}, 400);
  }

  final jwt = JWT.verify(token, SecretKey(Platform.environment['VONAGE_API_SIGNATURE_SECRET']!));

  if (jwt.payload['payload_hash'] == null) {
    return context.res.json({'ok': false, 'error': 'Missing payload hash.'}, 400);
  }

  final payloadHash = sha256.convert(utf8.encode(context.req.bodyRaw)).toString();

  if (jwt.payload['payload_hash'] != payloadHash) {
    return context.res.json({'ok': false, 'error': 'Payload hash mismatch.'}, 401);
  }

  final basicAuthToken = base64Encode(utf8.encode('${Platform.environment['VONAGE_API_KEY']}:${Platform.environment['VONAGE_API_SECRET']}'));

  await http.post(
    Uri.parse('https://messages-sandbox.nexmo.com/v1/messages'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic $basicAuthToken',
    },
    body: jsonEncode({
      'from': Platform.environment['VONAGE_WHATSAPP_NUMBER'],
      'to': context.req.body['from'],
      'message_type': 'text',
      'text': 'Hi there! You sent me: ${context.req.body['text']}',
      'channel': 'whatsapp',
    }),
  );

  return context.res.json({'ok': true});
}
