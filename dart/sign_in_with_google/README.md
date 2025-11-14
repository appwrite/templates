# sign-in-with-google

This function:

1. Verifies a Google ID token obtained from the client application.
1. If a user with matching id or email doesn't exist, a new user will be created.
1. The user's email will be verified if Google has verified it and it hasn't been already in Appwrite.
1. A token will be returned allowing the user to exchange the token for a session via `account.createSession()`.

> Note: This function verifies the Google ID token using Google's tokeninfo endpoint as described in the [official documentation](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).

## 🧰 Usage

### POST /

**Headers**

The Content-Type header must be set to `application/json` so that the request body can be properly parsed as JSON.

* `Content-Type`: `application/json`

**Request**

This function accepts:

* `idToken` (required) - Google ID token obtained from the client-side Google Sign-In flow

Sample request body:

```json
{
    "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjdlMzA3..."
}
```

**Response**

This function returns:

* `secret` - `secret` to be passed to `account.createSession()` to create a session
* `userId` - `userId` to be passed to `account.createSession()` to create a session
* `expire` - ISO formatted timestamp for when the secret expires

Sample `200` Response:

```json
{
  "secret": "0cbdd4fd7638e0f3f55871adf2256f8f42f6faa01c9300e482c9a585b76611343dee8562ce4421b1cf9e9de6f8341fb2286499cb7992d02accd2dc699211008c",
  "userId": "112345678901234567890",
  "expire": "2025-07-15T00:10:21.345+00:00"
}
```

## ⚙️ Configuration

| Setting           | Value                       |
| ----------------- | ---------------             |
| Runtime           | Dart (3.5 )                 |
| Entrypoint        | `lib/main.dart`             |
| Build Commands    | `dart pub get`              |
| Permissions       | `any`                       |
| Timeout (Seconds) | 15                          |
| Scopes            | `users.read`, `users.write` |

## 🔒 Environment Variables

The following environment variables are required:

* `GOOGLE_CLIENT_ID` - Your Google OAuth 2.0 Client ID from the Google Cloud Console

## 📱 Client-Side Integration

To obtain the Google ID token from your client application, use the [google_sign_in](https://pub.dev/packages/google_sign_in) package:

```dart
import 'package:google_sign_in/google_sign_in.dart';

final GoogleSignIn _googleSignIn = GoogleSignIn(
  clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
);

Future<void> signInWithGoogle() async {
  try {
    final GoogleSignInAccount? account = await _googleSignIn.signIn();
    if (account == null) return;
    
    final GoogleSignInAuthentication auth = await account.authentication;
    final String? idToken = auth.idToken;
    
    if (idToken != null) {
      // Send the idToken to your Appwrite function
      final response = await http.post(
        Uri.parse('YOUR_FUNCTION_URL'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'idToken': idToken}),
      );
      // Handle the response
    }
  } catch (error) {
    print('Error signing in with Google: $error');
  }
}
```

## 🔐 Security Notes

* The Google ID token is verified using Google's official tokeninfo endpoint
* The token's audience (client ID) is verified to match your application
* The token's issuer is verified to be Google
* The token's expiration time is checked
* Email verification status from Google is honored in Appwrite