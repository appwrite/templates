# sign-in-with-apple

This function:

1. Exchanges an authorization code with Apple to obtain the user's id token.
1. If a user with matching id or email doesn't exist, a new user will be created.
1. The user's email will be verified if is hasn't been already.
1. A token will be returned allowing the user to exchange the token for a session via `account.createSession()`.

> Note: this function uses an md5 hash of the `sub` as the user's id since the value from Apple is too long and has unsupported characters.

## 🧰 Usage

### POST /

**Headers**

The Content-Type header must be set to `application/json` so that the request body can be properly parsed as JSON.

* `Content-Type`: `application/json`

**Request**

This function accepts:

* `code` (required) - authorization code from the Sign in with Apple credential
* `firstName` - given name from the Sign in with Apple credential
* `lastName` - family name from the Sign in with Apple credential

Sample request body:

```json
{
    "code": "c361a519253b3486ea3c7ecd4e9b6903f.0.suut.3LCHm9ytku1B2v4r5IayPQ",
    "firstName": "Walter",
    "lastName": "O'Brien",
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
  "userId": "90a5450f396c242637c39b4c39e07af4",
  "expire": "2025-07-15T00:10:21.345+00:00",
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

* `BUNDLE_ID` - the bundle Id of the app that generated the authorization code
* `TEAM_ID` - Apple Developer team Id
* `KEY_ID` - Id of the key from the Apple Developer portal
* `KEY_CONTENTS_ENCODED` - base64 encoded p8 certificate
