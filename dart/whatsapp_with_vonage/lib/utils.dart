import 'dart:io';
import 'package:path/path.dart' as p;

void throwIfMissing(Map<String, String> env, List<String> keys) {
  final missing = <String>[];
  for (final key in keys) {
    if (!env.containsKey(key) || env[key] == null) {
      missing.add(key); 
    }
  }

  if (missing.isNotEmpty) {
    throw StateError('Missing environment variables: ${missing.join(', ')}');
  }
}

final staticFolder = p.join(p.dirname(Platform.script.toFilePath()), '../static');

String getStaticFile(String fileName) {
  final file = File(p.join(staticFolder, fileName));
  return file.readAsStringSync();
}