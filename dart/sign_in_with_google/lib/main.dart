import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:dart_appwrite/dart_appwrite.dart';
import 'package:dart_appwrite/models.dart';
import 'package:http/http.dart' as http;
import 'package:jose/jose.dart';

Future<dynamic> main(final context) async {
  final requiredEnvVars = [
    'GOOGLE_CLIENT_ID',
    'APPWRITE_FUNCTION_API_ENDPOINT',
    'APPWRITE_FUNCTION_PROJECT_ID',
  ];
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

  // Fetch Google's public keys for JWT verification
  http.Response certsResponse;
  try {
    certsResponse = await http
        .get(
      Uri.parse('https://www.googleapis.com/oauth2/v3/certs'),
    )
        .timeout(
      const Duration(seconds: 5),
      onTimeout: () {
        throw TimeoutException(
          'Request to fetch Google public keys timed out after 5 seconds',
        );
      },
    );
  } on TimeoutException catch (e) {
    context.log('Timeout fetching Google public keys: $e');
    throw Exception(
        'Failed to fetch Google public keys: Request timed out. Please try again.');
  } catch (e) {
    context.log('Error fetching Google public keys: $e');
    throw Exception('Failed to fetch Google public keys: $e');
  }

  if (certsResponse.statusCode != 200) {
    throw Exception(
        'Failed to fetch Google public keys: ${certsResponse.body}');
  }

  final jwks = JsonWebKeySet.fromJson(json.decode(certsResponse.body));

  // Parse the JWT to get the header
  final jwtParts = idToken.split('.');
  if (jwtParts.length != 3) {
    throw Exception('Invalid JWT format.');
  }

  // Decode header to get the key ID (kid)
  final headerJson = json.decode(
    utf8.decode(base64Url.decode(base64Url.normalize(jwtParts[0]))),
  );
  final keyId = headerJson['kid'] as String?;
  if (keyId == null) {
    throw Exception('JWT header does not contain a key ID (kid).');
  }

  // Find the matching key by kid (key ID)
  final key = jwks.keys.firstWhere(
    (k) => k.keyId == keyId,
    orElse: () => throw Exception('No matching key found for kid: $keyId'),
  );

  // Create a key store and verify the signature
  final keyStore = JsonWebKeyStore()..addKey(key);

  JsonWebToken jwt;
  try {
    // Verify and decode the JWT signature
    jwt = await JsonWebToken.decodeAndVerify(idToken, keyStore);
  } catch (e) {
    throw Exception('Failed to verify JWT signature: $e');
  }

  // Extract claims from the verified token
  final claims = jwt.claims;

  // Verify the token's audience matches our client ID
  final audiences = claims.audience ?? [];
  if (!audiences.contains(googleClientId)) {
    throw Exception('ID Token audience does not match the expected client ID.');
  }

  // Verify the token is issued by Google
  final iss = (claims.issuer?.toString() ?? '').trim();
  final validIssuers = ['https://accounts.google.com', 'accounts.google.com'];
  if (!validIssuers.contains(iss)) {
    throw Exception('ID Token is not issued by Google. Issuer: $iss');
  }

  // Verify the token has not expired
  final exp = claims.expiry;
  if (exp == null || exp.isBefore(DateTime.now())) {
    throw Exception('ID Token has expired.');
  }

  // Extract user information
  final userId = claims.subject ?? '';
  if (userId.isEmpty) {
    throw Exception('ID Token does not contain a valid subject (sub) claim.');
  }

  final claimsJson = claims.toJson();
  final email = claimsJson['email']?.toString() ?? '';
  final emailVerified = claimsJson['email_verified'] == true;
  final name = claimsJson['name']?.toString() ?? '';

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
    await users.updateEmailVerification(
      userId: user.$id,
      emailVerification: true,
    );
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
