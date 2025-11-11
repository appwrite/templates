import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:dart_appwrite/dart_appwrite.dart';
import 'package:dart_appwrite/models.dart';
import 'package:http/http.dart' as http;

Future<dynamic> main(final context) async {
  final requiredEnvVars = ['GOOGLE_CLIENT_ID'];
  for (var varName in requiredEnvVars) {
    if (Platform.environment[varName]?.isEmpty ?? true) {
      throw Exception('Environment variable $varName must be set.');
    }
  }

  final googleClientId = Platform.environment['GOOGLE_CLIENT_ID']!;

  final reqBody = context.req.bodyJson as Map<String, dynamic>;
  final idToken = reqBody['idToken'] ?? '';

  // Validate input
  if (idToken.isEmpty) {
    throw Exception('idToken must be provided in the request body.');
  }

  // Verify the Google ID token
  final tokenInfoResponse = await http.get(
    Uri.parse('https://oauth2.googleapis.com/tokeninfo?id_token=$idToken'),
  );

  if (tokenInfoResponse.statusCode != 200) {
    throw Exception(
      'Failed to verify Google ID token: ${tokenInfoResponse.body}',
    );
  }

  final tokenInfo = json.decode(tokenInfoResponse.body);

  // Verify the token's audience matches our client ID
  final aud = tokenInfo['aud'] ?? '';
  if (aud != googleClientId) {
    throw Exception('ID Token audience does not match the expected client ID.');
  }

  // Verify the token is issued by Google
  final iss = tokenInfo['iss'] ?? '';
  if (iss != 'https://accounts.google.com' && iss != 'accounts.google.com') {
    throw Exception('ID Token is not issued by Google.');
  }

  // Verify the token has not expired
  final exp = int.tryParse(tokenInfo['exp']?.toString() ?? '0') ?? 0;
  final currentTime = DateTime.now().millisecondsSinceEpoch ~/ 1000;
  if (exp <= currentTime) {
    throw Exception('ID Token has expired.');
  }

  // Extract user information
  final userId = tokenInfo['sub'] ?? '';
  if (userId.isEmpty) {
    throw Exception('ID Token does not contain a valid subject (sub) claim.');
  }

  final email = tokenInfo['email'] ?? '';
  final emailVerified = tokenInfo['email_verified'] == 'true';
  final name = tokenInfo['name'] ?? '';
  final picture = tokenInfo['picture'] ?? '';

  // You can use the Appwrite SDK to interact with other services
  // For this example, we're using the Users service
  final client = Client()
      .setEndpoint(Platform.environment['APPWRITE_FUNCTION_API_ENDPOINT']!)
      .setProject(Platform.environment['APPWRITE_FUNCTION_PROJECT_ID']!)
      .setKey(context.req.headers['x-appwrite-key'] ?? '');
  final users = Users(client);

  // Find user by ID
  User? user;
  try {
    user = await users.get(userId: userId);
  } on AppwriteException catch (e) {
    if (e.type != 'user_not_found') {
      rethrow;
    }
  }

  // Find user by email
  if (user == null && email.isNotEmpty) {
    final userList = await users.list(queries: [Query.equal('email', email)]);
    if (userList.users.isNotEmpty) {
      user = userList.users.first;
    }
  }

  // If user does not exist, create a new user
  user ??= await users.create(
    userId: ID.custom(userId),
    email: email.isEmpty ? null : email,
    name: name.isEmpty ? null : name,
  );

  // Mark the user as verified if the email is verified by Google and not already verified
  if (emailVerified && !user.emailVerification) {
    users.updateEmailVerification(userId: userId, emailVerification: true);
  }

  // Create token
  final token = await users.createToken(
    userId: user.$id,
    expire: 60,
    length: 128,
  );

  return context.res.json({
    'secret': token.secret,
    'userId': user.$id,
    'expire': token.expire,
  });
}
