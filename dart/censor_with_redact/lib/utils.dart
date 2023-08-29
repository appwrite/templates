import 'dart:io';

final String _dirname = Platform.script.toFilePath();
final String staticFolder = '${Uri.file(_dirname).resolve('../static')}';

/// Throws an error if any of the keys are missing from the object
void throwIfMissing(Map<String, dynamic> obj, List<String> keys) {
  final missing = <String>[];
  for (var key in keys) {
    if (!obj.containsKey(key) || obj[key] == null) {
      missing.add(key);
    }
  }
  if (missing.isNotEmpty) {
    throw Exception('Missing required fields: ${missing.join(', ')}');
  }
}

/// Returns the contents of a file in the static folder
/// @param fileName - The name of the file to read
/// @returns Contents of static/{fileName}
String getStaticFile(String fileName) {
  return File('$staticFolder/$fileName').readAsStringSync();
}
