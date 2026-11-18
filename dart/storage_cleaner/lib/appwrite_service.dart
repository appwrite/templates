import 'dart:io';

import 'package:dart_appwrite/dart_appwrite.dart';
import 'package:dart_appwrite/models.dart';
import 'utils.dart';

class AppwriteService {
  late Client client;
  late Storage storage;
  AppwriteService() {
    client = Client()
      ..setEndpoint(Platform.environment['APPWRITE_ENDPOINT'] ??
          'https://cloud.appwrite.io/v1')
      ..setProject(Platform.environment['APPWRITE_FUNCTION_PROJECT_ID'])
      ..setKey(Platform.environment['APPWRITE_API_KEY']);

    storage = Storage(client);
  }

  Future cleanBucket(String bucketId) async {
    FileList response;
    var queries = [
      Query.lessThan('\$createdAt', getExpiryDate()),
      Query.limit(25),
    ];

    do {
      response = await storage.listFiles(bucketId: bucketId, queries: queries);

      await Future.wait(
        response.files.map(
          (file) => storage.deleteFile(bucketId: bucketId, fileId: file.$id),
        ),
      );
    } while (response.files.isNotEmpty);
  }
}
