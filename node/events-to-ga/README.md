# ⚡ Google Analytics Event Reporter

The function will be triggered by configured Appwrite events and report these events to Google Analytics.

## 🧰 Usage

### POST /

Gets the event from the header.

**Parameters**

| Name               | Description                    | Location | Type   | Sample Value          |
| ------------------ | ------------------------------ | -------- | ------ | --------------------- |
| x-appwrite-user-id | User ID from Appwrite.         | Header   | String | 642...7cd             |
| x-appwrite-event   | Describes the triggering event | Header   | String | users.65...f19.delete |
| x-appwrite-trigger | Type of trigger for function   | Header   | String | event                 |

**Response**

Sample `200` Response:

```json
{
  "ok": true,
  "message": "event users.653...df19.delete is send to google analytics"
}
```

Sample `503` Response:
503 response is send when the response status code while sending event to Google Analytics is not within 200-299 range

```json
{
  "ok": false,
  "message": "Response status code when posting event to Google Analytics is 503"
}
```

Sample `401` Response:

```json
{ "ok": false, "message": "Error Posting Event to Google Analytics" }
```

## ⚙️ Configuration

| Setting        | Value         |
| -------------- | ------------- |
| Runtime        | Node (18.0)   |
| Entrypoint     | `src/main.js` |
| Build Commands | `npm install` |
| Permissions    |               |
| Events         | all           |

## 🔒 Environment Variables

### APPWRITE_FUNCTION_PROJECT_ID

Project ID in which Appwrite Function is added.

| Question      | Answer                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                |
| Sample Value  | `6524d.....6e5`                                                                                    |
| Documentation | [Appwrite: Getting Started for Server](https://appwrite.io/docs/getting-started-for-server#apiKey) |

### GA4_MEASUREMENT_ID

API Key to talk to Appwrite backend APIs.

| Question      | Answer                                                                                                         |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                            |
| Sample Value  | `G-NY5...26R`                                                                                                  |
| Documentation | [Google Analytics 4 docs](https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference) |

### GA4_API_SECRET

API Key to talk to Appwrite backend APIs.

| Question      | Answer                                                                                                         |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| Required      | Yes / No                                                                                                       |
| Sample Value  | `d1efb...aec35`                                                                                                |
| Documentation | [Google Analytics 4 docs](https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference) |
