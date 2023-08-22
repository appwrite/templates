# 📄 Node.js Generate PDF Function

Document containing sample invoice in PDF format

## 🧰 Usage

### GET /

Returns a PDF invoice

No parameters required.

**Response**

Sample `200` Response:

Returns a binary stream of the generated PDF document. The `Content-Type` of the response will be set as `application/pdf`.

## ⚙️ Configuration

| Setting           | Value         |
| ----------------- | ------------- |
| Runtime           | Node (18.0)   |
| Entrypoint        | `src/main.js` |
| Build Commands    | `npm install` |
| Permissions       | `any`         |
| Timeout (Seconds) | 15            |

## 🔒 Environment Variables

No environment variables required.