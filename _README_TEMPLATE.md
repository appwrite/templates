<!-- Name your function -->
# ⚡ Template Function

<!-- Write short function tagline -->
Your function's description goes here.

## 🧰 Usage

<!-- Copy section for each endpoint -->
<!-- Document endpoint method and url  -->
### GET /

<!-- Describe the endpoint -->
Your endpoint description goes here.

**Parameters**
<!-- Document each expected parameter -->
| Name   | Description                       | Location                     | Type                               | Sample Value |
|--------|-----------------------------------|------------------------------|------------------------------------|--------------|
| userId | Your param description goes here. | Path / Query / Body / Header | String / Number / Boolean / Object | 642...7cd    |

**Response**

<!-- Provide sample body for successful response -->

Sample `200` Response:

```json
{ "ok": true }
```

<!-- If relevant, document error responses -->

Sample `400` Response:

```json
{ "ok": false, "message": "Missing userId parameter." }
```

## ⚙️ Configuration

<!-- Update values and remove irrelevant settings -->
| Setting           | Value            |
|-------------------|------------------|
| Runtime           | Node (18.0)      |
| Entrypoint        | `src/main.js`    |
| Build Commands    | `npm run build`  |
| Permissions       | `any`            |
| Events            | `users.*.create` |
| CRON              | `0 * * * *`      |
| Timeout (Seconds) | 15               |

## 🔒 Environment Variables

<!-- Copy section for each variable -->
<!-- Name the variable -->
### APPWRITE_API_KEY

<!-- Describe the variable -->
API Key to talk to Appwrite backend APIs. 

<!-- Mark if variable is required or not -->
<!-- Provide sample (but invalid) value -->
<!-- Link to docs or remove if irrelevant -->
| Question       | Answer          |
|----------------|-----------------|
| Required       | Yes / No        |
| Sample Value   | `d1efb...aec35` |
| Documentation  | [Appwrite: Getting Started for Server](https://appwrite.io/docs/advanced/platform/api-keys) |
