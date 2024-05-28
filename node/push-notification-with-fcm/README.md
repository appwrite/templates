# 🔔 Node.js Push Notifications with FCM Function

Send push notifications to your users using Firebase Cloud Messaging (FCM).

## 🧰 Usage

### POST /

Send a push notification to a user.

**Parameters**

| Name         | Description                          | Location | Type               | Sample Value   |
| ------------ | ------------------------------------ | -------- | ------------------ | -------------- |
| Content-Type | The content type of the request body | Header   | `application/json` | N/A            |
| deviceToken  | FCM device identifier                | Body     | String             | `642...7cd`    |
| message      | Message to send                      | Body     | Object             | `{"title": "hello","body": "how are you?"}` |
| data      | Additional data to pass                         | Body     | Object             | `{"greet": "welcome"}` |

**Request**

`deviceToken` and `message` are required. `data` is optional.


```json
{
    "deviceToken": "642...7cd",
    "message": {
        "title": "hello",
        "body": "how are you?"
    },
    "data": {
        "greet": "welcome" 
    }    
}
```


**Response**

Sample `200` Response:

```json
{
  "ok": true,
  "messageId": "as4jg109cbe1"
}
```

Sample `400` Response:

```json
{
  "ok": false,
  "error": "Device token and message are required."
}
```

Sample `500` Response:

```json
{
  "ok": false,
  "error": "Failed to send the message."
}
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

### FCM_PROJECT_ID

A unique identifier for your FCM project.

| Question      | Answer                                                                             |
| ------------- | ---------------------------------------------------------------------------------- |
| Required      | Yes                                                                                |
| Sample Value  | `mywebapp-f6e57`                                                                   |
| Documentation | [FCM: Project ID](https://firebase.google.com/docs/projects/learn-more#project-id) |

### FCM_CLIENT_EMAIL

Your FCM service account email.

| Question      | Answer                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| Required      | Yes                                                                                                          |
| Sample Value  | `fcm-adminsdk-1a0de@test-f6e57.iam.gserviceaccount.com`                                                      |
| Documentation | [FCM: SDK Setup](https://firebase.google.com/docs/admin/setup#initialize_the_sdk_in_non-google_environments) |

### FCM_PRIVATE_KEY

A unique private key used to authenticate with FCM.

| Question      | Answer                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| Required      | Yes                                                                                                          |
| Sample Value  | `0b6830cc66d92804e11af2153242d34211d675675`                                                                  |
| Documentation | [FCM: SDK Setup](https://firebase.google.com/docs/admin/setup#initialize_the_sdk_in_non-google_environments) |

### FCM_DATABASE_URL

URL of your FCM database.

| Question      | Answer                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| Required      | Yes                                                                                                          |
| Sample Value  | `https://my-app-e398e.firebaseio.com`                                                                        |
| Documentation | [FCM: SDK Setup](https://firebase.google.com/docs/admin/setup#initialize_the_sdk_in_non-google_environments) |
