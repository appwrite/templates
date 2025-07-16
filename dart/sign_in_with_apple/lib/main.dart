import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:crypto/crypto.dart';
import 'package:dart_appwrite/dart_appwrite.dart';
import 'package:dart_appwrite/models.dart';
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';
import 'package:http/http.dart' as http;

Future<dynamic> main(final context) async {
  final requiredEnvVars = [
    'BUNDLE_ID',
    'TEAM_ID',
    'KEY_ID',
    'KEY_CONTENTS_ENCODED'
  ];
  for (var varName in requiredEnvVars) {
    if (Platform.environment[varName]?.isEmpty ?? true) {
      throw Exception('Environment variable $varName must be set.');
    }
  }

  final bundleId = Platform.environment['BUNDLE_ID']!;
  final teamId = Platform.environment['TEAM_ID']!;
  final keyId = Platform.environment['KEY_ID']!;
  final keyContentsEncoded = Platform.environment['KEY_CONTENTS_ENCODED']!;
  final keyContents = utf8.decode(base64Decode(keyContentsEncoded));

  final key = ECPrivateKey(keyContents);

  final reqBody = context.req.bodyJson as Map<String, dynamic>;
  final code = reqBody['code'] ?? '';
  final firstName = reqBody['firstName'] ?? '';
  final lastName = reqBody['lastName'] ?? '';

  // Validate input
  if (code.isEmpty) {
    throw Exception('Code must be provided in the request body.');
  }

  // Create a JWT client secret
  final header = {'alg': 'ES256', 'kid': keyId};
  final jwt = JWT(
    {},
    header: header,
    subject: bundleId,
    issuer: teamId,
    audience: Audience.one('https://appleid.apple.com'),
  );
  final clientSecret = jwt.sign(
    key,
    algorithm: JWTAlgorithm.ES256,
    expiresIn: Duration(minutes: 5),
  );

  final authTokenRequestBody = {
    'grant_type': 'authorization_code',
    'code': code,
    'client_id': bundleId,
    'client_secret': clientSecret,
  };

  final authTokenResponse = await http.post(
    Uri.parse('https://appleid.apple.com/auth/token'),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: authTokenRequestBody,
  );

  if (authTokenResponse.statusCode != 200) {
    throw Exception(
        'Failed to exchange code for token: ${authTokenResponse.body}');
  }

  final body = json.decode(authTokenResponse.body);

  // Use access token to fetch any additional information if needed
  // final accessToken = body['access_token'] ?? '';

  // Store refresh token if you want to refresh the access token later
  // final refreshToken = body['refresh_token'] ?? '';

  final idToken = JWT.decode(body['id_token']);
  final sub = idToken.payload['sub'] ?? '';
  if (sub.isEmpty) {
    throw Exception('ID Token does not contain a valid subject (sub) claim.');
  }
  // Hash the sub because it is too long and has characters that are not allowed in Appwrite user IDs
  final userId = md5.convert(utf8.encode(sub)).toString();
  final email = idToken.payload['email'] ?? '';
  final userName = '$firstName $lastName'.trim();

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
  final userList = await users.list(queries: [Query.equal('email', email)]);
  if (userList.users.isNotEmpty) {
    user = userList.users.first;
  }

  // If user does not exist, create a new user
  user ??= await users.create(
    userId: ID.custom(userId),
    email: email,
    name: userName.isEmpty ? null : userName,
  );

  // Mark the user as verified if not already verified
  if (!user.emailVerification) {
    users.updateEmailVerification(
      userId: userId,
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
