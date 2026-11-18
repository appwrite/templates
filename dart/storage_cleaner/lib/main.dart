import 'dart:async';
import 'dart:io';
import 'appwrite_service.dart';
import 'utils.dart';

Future<dynamic> main(final context) async {
  throwIfMissing(Platform.environment, [
    'APPWRITE_API_KEY',
    'RETENTION_PERIOD_DAYS',
    'APPWRITE_BUCKET_ID',
  ]);

  var appwrite = AppwriteService();

  await appwrite.cleanBucket(Platform.environment['APPWRITE_BUCKET_ID']!);

  return context.res.send('Buckets cleaned', 200);
}
