# ⚡ Push Notifications with FCM Function

Send push notifications to your users using Firebase Cloud Messaging (FCM).

## 🧰 Usage

### `POST` `Content-Type: application/json`

Send a push notification to a user.

**Parameters**

| Name        | Description                | Location | Type   | Sample Value   |
| ----------- | -------------------------- | -------- | ------ | -------------- |
| deviceToken | Firebase device identifier | Body     | String | `642...7cd`    |
| message     | Message to send            | Body     | String | `Hello World!` |

**Response**

Sample `200` Response:

```json
Successfully sent message: as4jg109cbe1
```

Sample `400` Response:

```text
Device token and message are required.
```

Sample `500` Response:

```text
Failed to send the message.
```

## ⚙️ Configuration

| Setting           | Value         |
| ----------------- | ------------- |
| Runtime           | Node (18.0)   |
| Entrypoint        | `src/main.js` |
| Build Commands    | `npm install` |
| Permissions       | `any`         |
| Timeout (Seconds) | 15            |

## 🔒 Environment Variables

      FIREBASE_PROJECT_ID?: string;
      FIREBASE_CLIENT_EMAIL?: string;
      FIREBASE_PRIVATE_KEY?: string;

### FIREBASE_PROJECT_ID

A unique identifier for your Firebase project.

| Question      | Answer                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                           |
| Sample Value  | `mywebapp-f6e57`                                                                                    |
| Documentation | [Firebase: Project ID](https://firebase.google.com/docs/projects/learn-more#project-id) |

### FIREBASE_CLIENT_EMAIL

Your Firebase service account email.

| Question      | Answer                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                           |
| Sample Value  | `firebase-adminsdk-1a0de@test-f6e57.iam.gserviceaccount.com`                                                                                    |
| Documentation | [Firebase: SDK Setup](https://firebase.google.com/docs/admin/setup#initialize_the_sdk_in_non-google_environments) |

### FIREBASE_PRIVATE_KEY

A unique private key used to authenticate with Firebase.

| Question      | Answer                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                           |
| Sample Value | `0b6830cc66d92804e11af2153242d34211d675675` |
| Documentation | [Firebase: SDK Setup](https://firebase.google.com/docs/admin/setup#initialize_the_sdk_in_non-google_environments) |


