import 'dart:io';

String getExpiryDate() {
  final retentionPeriod =
      int.parse(Platform.environment['RETENTION_PERIOD_DAYS'] ?? "30");
  final now = DateTime.now();
  final expiryDate = now.subtract(Duration(days: retentionPeriod));

  return expiryDate.toIso8601String();
}

/// Throws an error if any of the keys are missing from the object
/// @param obj - The object to check
/// @param keys - The list of keys to check for
/// @throws Exception
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
