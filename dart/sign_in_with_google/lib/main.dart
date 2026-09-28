import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:dart_appwrite/dart_appwrite.dart';
import 'package:dart_appwrite/models.dart';
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';
import 'package:http/http.dart' as http;

class GoogleOAuthConfig {
  static const googleCertsUrl = 'https://www.googleapis.com/oauth2/v1/certs';
  static const validIssuers = [
    'https://accounts.google.com',
    'accounts.google.com'
  ];
  static const certCacheDuration = Duration(hours: 1);
  static const httpTimeout = Duration(seconds: 5);
  static const tokenExpiryMinutes = 60;
  static const tokenLength = 128;
}

class GoogleCertificateCache {
  Map<String, String>? _certificates;
  DateTime? _expiryTime;

  bool get needsRefresh =>
      _expiryTime == null || DateTime.now().isAfter(_expiryTime!);

  Map<String, String>? get value => needsRefresh ? null : _certificates;

  void store(Map<String, String> certificates, Duration cacheDuration) {
    _certificates = certificates;
    _expiryTime = DateTime.now().add(cacheDuration);
  }

  void invalidate() {
    _certificates = null;
    _expiryTime = null;
  }
}

class GoogleOAuthException implements Exception {
  final String message;
  final String? details;
  final int statusCode;

  GoogleOAuthException(this.message, {this.details, this.statusCode = 400});

  @override
  String toString() => details != null ? '$message: $details' : message;
}

class GoogleTokenValidator {
  final String clientId;
  final GoogleCertificateCache _cache;

  GoogleTokenValidator(this.clientId, this._cache);
  Duration _parseCacheControl(String? cacheControl) {
    if (cacheControl == null || cacheControl.isEmpty) {
      return GoogleOAuthConfig.certCacheDuration;
    }

    // "public, max-age=24784, must-revalidate, no-transform"
    final directives = cacheControl.split(',').map((d) => d.trim());

    for (final directive in directives) {
      if (directive.startsWith('max-age=')) {
        try {
          final seconds = int.parse(directive.substring(8));
          // minimum 1 hour, maximum 7 days
          final boundedSeconds = seconds.clamp(3600, 604800);
          return Duration(seconds: boundedSeconds);
        } catch (e) {
          break;
        }
      }
    }

    return GoogleOAuthConfig.certCacheDuration;
  }

  Future<CertificateResponse> _fetchCertificates() async {
    try {
      final response = await http
          .get(Uri.parse(GoogleOAuthConfig.googleCertsUrl))
          .timeout(GoogleOAuthConfig.httpTimeout);

      if (response.statusCode != 200) {
        throw GoogleOAuthException(
          'Failed to fetch Google certificates',
          details: 'HTTP ${response.statusCode}',
          statusCode: 502,
        );
      }

      final certificates = Map<String, String>.from(json.decode(response.body));
      final cacheDuration =
          _parseCacheControl(response.headers['cache-control']);

      return CertificateResponse(
        certificates: certificates,
        cacheDuration: cacheDuration,
      );
    } on TimeoutException {
      throw GoogleOAuthException(
        'Certificate fetch timeout',
        details: 'Google servers did not respond in time',
        statusCode: 504,
      );
    } on SocketException catch (e) {
      throw GoogleOAuthException(
        'Network error fetching certificates',
        details: e.message,
        statusCode: 503,
      );
    } catch (e) {
      throw GoogleOAuthException(
        'Unexpected error fetching certificates',
        details: e.toString(),
        statusCode: 500,
      );
    }
  }

  Future<Map<String, String>> _getCertificates(context) async {
    final cached = _cache.value;
    if (cached != null) {
      context.log('Using cached Google certificates');
      return cached;
    }

    context.log('Fetching fresh Google certificates');
    final response = await _fetchCertificates();

    _cache.store(response.certificates, response.cacheDuration);
    context.log(
        'Certificates cached for ${response.cacheDuration.inSeconds} seconds (from Cache-Control header)');

    return response.certificates;
  }

  JwtComponents _parseJwtStructure(String token) {
    final parts = token.split('.');
    if (parts.length != 3) {
      throw GoogleOAuthException('Malformed JWT token');
    }

    try {
      final headerJson = json.decode(
        utf8.decode(base64Url.decode(base64Url.normalize(parts[0]))),
      );
      final kid = headerJson['kid'] as String?;

      if (kid == null || kid.isEmpty) {
        throw GoogleOAuthException('JWT missing key ID (kid)');
      }

      return JwtComponents(parts, kid);
    } catch (e) {
      throw GoogleOAuthException('Failed to parse JWT header',
          details: e.toString());
    }
  }

  JWT _verifySignature(String token, String pemCertificate) {
    try {
      return JWT.verify(token, RSAPublicKey.cert(pemCertificate));
    } on JWTExpiredException {
      throw GoogleOAuthException('Token has expired');
    } on JWTException catch (e) {
      throw GoogleOAuthException('Invalid token signature', details: e.message);
    } catch (e) {
      throw GoogleOAuthException('Token verification failed',
          details: e.toString());
    }
  }

  GoogleUserInfo _validateClaims(Map<String, dynamic> payload) {
    final aud = payload['aud']?.toString() ?? '';
    if (aud != clientId) {
      throw GoogleOAuthException('Token audience mismatch');
    }

    final iss = (payload['iss']?.toString() ?? '').trim();
    if (!GoogleOAuthConfig.validIssuers.contains(iss)) {
      throw GoogleOAuthException('Invalid token issuer', details: iss);
    }

    final exp = payload['exp'] as int?;
    if (exp == null) {
      throw GoogleOAuthException('Token missing expiration claim');
    }

    final expiryDate = DateTime.fromMillisecondsSinceEpoch(exp * 1000);
    if (expiryDate.isBefore(DateTime.now())) {
      throw GoogleOAuthException('Token has expired');
    }

    final userId = payload['sub']?.toString() ?? '';
    if (userId.isEmpty) {
      throw GoogleOAuthException('Token missing user ID (sub)');
    }

    return GoogleUserInfo(
      userId: userId,
      email: payload['email']?.toString() ?? '',
      emailVerified: payload['email_verified'] == true,
      name: payload['name']?.toString() ?? '',
    );
  }

  Future<GoogleUserInfo> validate(String idToken, context) async {
    final components = _parseJwtStructure(idToken);
    final certificates = await _getCertificates(context);

    final pemCert = certificates[components.keyId];
    if (pemCert == null) {
      _cache.invalidate();
      throw GoogleOAuthException(
        'Certificate not found',
        details: 'kid: ${components.keyId}',
      );
    }

    final jwt = _verifySignature(idToken, pemCert);
    final payload = jwt.payload as Map<String, dynamic>;

    return _validateClaims(payload);
  }
}

class AppwriteUserManager {
  final Users _users;

  AppwriteUserManager(this._users);

  Future<User?> findUser(String userId, String email) async {
    try {
      return await _users.get(userId: userId);
    } on AppwriteException catch (e) {
      if (e.type != 'user_not_found') {
        rethrow;
      }
    }
    if (email.isNotEmpty) {
      try {
        final userList = await _users.list(
          queries: [Query.equal('email', email)],
        );
        return userList.users.isNotEmpty ? userList.users.first : null;
      } on AppwriteException catch (_) {
        return null;
      }
    }

    return null;
  }

  Future<User> createUser(GoogleUserInfo userInfo) async {
    return await _users.create(
      userId: ID.custom(userInfo.userId),
      email: userInfo.email.isEmpty ? null : userInfo.email,
      name: userInfo.name.isEmpty ? null : userInfo.name,
    );
  }

  Future<void> ensureEmailVerified(User user, bool shouldBeVerified) async {
    if (shouldBeVerified && !user.emailVerification) {
      await _users.updateEmailVerification(
        userId: user.$id,
        emailVerification: true,
      );
    }
  }

  Future<Token> generateToken(String userId) async {
    return await _users.createToken(
      userId: userId,
      expire: GoogleOAuthConfig.tokenExpiryMinutes,
      length: GoogleOAuthConfig.tokenLength,
    );
  }
}

class CertificateResponse {
  final Map<String, String> certificates;
  final Duration cacheDuration;

  CertificateResponse({
    required this.certificates,
    required this.cacheDuration,
  });
}

class JwtComponents {
  final List<String> parts;
  final String keyId;

  JwtComponents(this.parts, this.keyId);
}

class GoogleUserInfo {
  final String userId;
  final String email;
  final bool emailVerified;
  final String name;

  GoogleUserInfo({
    required this.userId,
    required this.email,
    required this.emailVerified,
    required this.name,
  });
}

class AuthResponse {
  final String secret;
  final String userId;
  final String expire;

  AuthResponse({
    required this.secret,
    required this.userId,
    required this.expire,
  });

  Map<String, dynamic> toJson() => {
        'secret': secret,
        'userId': userId,
        'expire': expire,
      };
}

class EnvironmentConfig {
  final String googleClientId;
  final String apiEndpoint;
  final String projectId;

  EnvironmentConfig._({
    required this.googleClientId,
    required this.apiEndpoint,
    required this.projectId,
  });

  static EnvironmentConfig load() {
    final requiredVars = {
      'GOOGLE_CLIENT_ID': 'Google OAuth Client ID',
      'APPWRITE_FUNCTION_API_ENDPOINT': 'Appwrite API endpoint',
      'APPWRITE_FUNCTION_PROJECT_ID': 'Appwrite Project ID',
    };

    for (final entry in requiredVars.entries) {
      final value = Platform.environment[entry.key];
      if (value == null || value.isEmpty) {
        throw GoogleOAuthException(
          'Missing required configuration',
          details: '${entry.value} (${entry.key}) must be set',
          statusCode: 500,
        );
      }
    }

    return EnvironmentConfig._(
      googleClientId: Platform.environment['GOOGLE_CLIENT_ID']!,
      apiEndpoint: Platform.environment['APPWRITE_FUNCTION_API_ENDPOINT']!,
      projectId: Platform.environment['APPWRITE_FUNCTION_PROJECT_ID']!,
    );
  }
}

class GoogleOAuthHandler {
  final GoogleTokenValidator _validator;
  final AppwriteUserManager _userManager;

  GoogleOAuthHandler(
    this._validator,
    this._userManager,
  );

  Future<AuthResponse> authenticate(String idToken, context) async {
    context.log('Starting Google OAuth authentication');

    final userInfo = await _validator.validate(idToken, context);
    context.log('Token validated for user: ${userInfo.userId}');

    var user = await _userManager.findUser(userInfo.userId, userInfo.email);

    if (user == null) {
      context.log('Creating new user: ${userInfo.userId}');
      user = await _userManager.createUser(userInfo);
    } else {
      context.log('Found existing user: ${user.$id}');
    }
    await _userManager.ensureEmailVerified(user, userInfo.emailVerified);
    final token = await _userManager.generateToken(user.$id);
    context.log('Generated token for user: ${user.$id}');

    return AuthResponse(
      secret: token.secret,
      userId: user.$id,
      expire: token.expire,
    );
  }
}

final _certificateCache = GoogleCertificateCache();

Future<dynamic> main(final context) async {
  try {
    final config = EnvironmentConfig.load();
    final reqBody = context.req.bodyJson as Map<String, dynamic>?;
    if (reqBody == null) {
      throw GoogleOAuthException('Request body is required');
    }

    final idToken = reqBody['idToken']?.toString() ?? '';
    if (idToken.isEmpty) {
      throw GoogleOAuthException('idToken is required in request body');
    }
    final client = Client()
        .setEndpoint(config.apiEndpoint)
        .setProject(config.projectId)
        .setKey(context.req.headers['x-appwrite-key'] ?? '');
    final validator =
        GoogleTokenValidator(config.googleClientId, _certificateCache);
    final userManager = AppwriteUserManager(Users(client));
    final handler = GoogleOAuthHandler(validator, userManager);
    final response = await handler.authenticate(idToken, context);

    return context.res.json(response.toJson());
  } on GoogleOAuthException catch (e) {
    context.error('OAuth error: $e');
    return context.res.json(
      {'error': e.message, 'details': e.details},
      statusCode: e.statusCode,
    );
  } on AppwriteException catch (e) {
    context.error('Appwrite error: ${e.message}');
    return context.res.json(
      {'error': 'Authentication service error', 'details': e.message},
      statusCode: e.code ?? 500,
    );
  } catch (e, stackTrace) {
    context.error('Unexpected error: $e\n$stackTrace');
    return context.res.json(
      {
        'error': 'Internal server error',
        'details': 'An unexpected error occurred'
      },
      statusCode: 500,
    );
  }
}
