# 📬 Node.js Authenticate with Passkey

Sign-in with passkey into Appwrite Account.

## 🧰 Usage

Read tutorial [article on Dev.to](https://dev.to/meldiron/biometric-authentication-with-passkeys-3e1) to learn more.

## ⚙️ Configuration

| Setting           | Value           |
| ----------------- | --------------- |
| Runtime           | Node (18.0)     |
| Entrypoint        | `src/main.js`   |
| Build Commands    | `npm install && npm run setup` |
| Permissions       | `any`           |
| Timeout (Seconds) | 15              |

## 🔒 Environment Variables

### ALLOWED_HOSTNAME

Hostname (like `myapp.com`, without protocol or port) that is allowed to use passkey authentication.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | No                             |
| Sample Value | `passkeydemo.appwrite.global` |

### APPWRITE_API_KEY

API Key to talk to Appwrite backend APIs.

| Question      | Answer                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                                |
| Sample Value  | `d1efb...aec35`                                                                                    |
| Documentation | [Appwrite: Getting Started for Server](https://appwrite.io/docs/advanced/platform/api-keys) |

### APPWRITE_ENDPOINT

The URL endpoint of the Appwrite server. If not provided, it defaults to the Appwrite Cloud server: `https://cloud.appwrite.io/v1`.

| Question     | Answer                         |
| ------------ | ------------------------------ |
| Required     | No                             |
| Sample Value | `https://cloud.appwrite.io/v1` |