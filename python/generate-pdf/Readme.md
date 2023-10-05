# 📄 Python Generate PDF Function

Document containing a sample invoice in PDF format.

## 🧰 Usage

### GET /

Returns a PDF invoice.

No parameters required.

**Response**

Sample `200` Response:

- Returns a binary stream of the generated PDF document.
- The `Content-Type` of the response will be set as `application/pdf`.

## ⚙️ Configuration

| Setting           | Value                 |
| ----------------- | --------------------- |
| Runtime           | Python (3.8 or later) |
| Entrypoint        | `src/main.py`         |
| Build Commands    | `pip install -r requirements.txt` |
| Permissions       | `any`                 |
| Timeout (Seconds) | 15                    |

## 🔒 Environment Variables

No environment variables required.

> Note: Ensure you have a `requirements.txt` file in the project directory containing all the necessary packages (like `Faker`, `pdfkit`, etc.).
