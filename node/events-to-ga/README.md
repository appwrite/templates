<!-- Name your function -->

# ⚡ Template Function

<!-- Write short function tagline -->

The function will be triggered by configured Appwrite events and report these events to Google Analytics.

## 🧰 Usage

<!-- Copy section for each endpoint -->
<!-- Document endpoint method and url  -->

### POST /

<!-- Describe the endpoint -->

Gets the event from the header.

**Parameters**

<!-- Document each expected parameter -->

| Name               | Description                    | Location | Type   | Sample Value          |
| ------------------ | ------------------------------ | -------- | ------ | --------------------- |
| x-appwrite-user-id | User ID from Appwrite.         | Header   | String | 642...7cd             |
| x-appwrite-event   | Describes the triggering event | Header   | String | users.65...f19.delete |
| x-appwrite-trigger | Type of trigger for function   | Header   | String | event                 |

**Response**

<!-- Provide sample body for successful response -->

Sample `200` Response:

```json
{
      "ok": true,
      "message": "event users.653...df19.delete is send to google analytics",
}
```

<!-- If relevant, document error responses -->

Sample `503` Response:

```json
{ "ok": false, "message": "Response status code when posting event to Google Analytics is 503" }
```

Sample `401` Response:

```json
{ "ok": false, "message": "Error Posting Event to Google Analytics" }
```
## ⚙️ Configuration

<!-- Update values and remove irrelevant settings -->

| Setting           | Value            |
| ----------------- | ---------------- |
| Runtime           | Node (18.0)      |
| Entrypoint        | `src/main.js`    |
| Build Commands    | `npm install`    |
| Permissions       | `any`            |
| Events            | all              |

## 🔒 Environment Variables

<!-- Copy section for each variable -->
<!-- Name the variable -->


### APPWRITE_FUNCTION_PROJECT_ID

<!-- Describe the variable -->

Project ID in which Appwrite Function is added.

<!-- Mark if variable is required or not -->
<!-- Provide sample (but invalid) value -->
<!-- Link to docs or remove if irrelevant -->

| Question      | Answer                                                                                                       |
| ------------- | -------------------------------------------------------------------------------------------------------------|
| Required      | Yes                                                                                                          |
| Sample Value  | `6524d.....6e5`                                                                                              |
| Documentation | [Appwrite: Getting Started for Server](https://appwrite.io/docs/getting-started-for-server#apiKey)           |


### GA4_Measurement_Id

<!-- Describe the variable -->

API Key to talk to Appwrite backend APIs.

<!-- Mark if variable is required or not -->
<!-- Provide sample (but invalid) value -->
<!-- Link to docs or remove if irrelevant -->

| Question      | Answer                                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------------------------|
| Required      | Yes                                                                                                           |
| Sample Value  | `G-NY5...26R`                                                                                                 |
| Documentation | [Google Analytics 4 docs](https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference)|


### APPWRITE_ENDPOINT

<!-- Describe the variable -->

API Key to talk to Appwrite backend APIs.

<!-- Mark if variable is required or not -->
<!-- Provide sample (but invalid) value -->
<!-- Link to docs or remove if irrelevant -->

| Question      | Answer                                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------------------------|
| Required      | Yes                                                                                                           |
| Sample Value  | `https://cloud.appwrite.io/v1`                                                                                |
| Documentation | [Google Analytics 4 docs](https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference)|

### GA4_API_SECRET

<!-- Describe the variable -->

API Key to talk to Appwrite backend APIs.

<!-- Mark if variable is required or not -->
<!-- Provide sample (but invalid) value -->
<!-- Link to docs or remove if irrelevant -->

| Question      | Answer                                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------------------------|
| Required      | Yes / No                                                                                                      |
| Sample Value  | `d1efb...aec35`                                                                                               |
| Documentation | [Google Analytics 4 docs](https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference)|
