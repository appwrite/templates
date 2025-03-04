# 📄 Dart Generate PDF Function

Generates a sample invoice in PDF.

## 🧰 Usage

### GET /

Returns a PDF invoice.

No parameters required.

**Response**

Sample `200` Response:

Returns a binary stream of the generated PDF document. The `Content-Type` of the response will be set as `application/pdf`.

## ⚙️ Configuration

| Setting           | Value           |
| ----------------- | --------------- |
| Runtime           | Dart (3.7.1)     |
| Entrypoint        | `lib/main.dart` |
| Build Commands    | `dart pub get`  |
| Permissions       | `any`           |
| Timeout (Seconds) | 15              |

## 🔒 Environment Variables

No environment variables required.
