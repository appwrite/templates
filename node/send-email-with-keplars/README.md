# 📧 Send Email with Keplars

Send transactional emails from your Appwrite Function using the [Keplars](https://keplars.com) priority-queue API — instant, high, async, or bulk delivery.

## 🧰 Usage

### GET /

Returns a 405 Method Not Allowed.

### POST /

Send an email.

**Request body:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `to` | string \| string[] | Yes | Recipient email address(es) |
| `from` | string | Yes | Sender address (must be verified in Keplars) |
| `subject` | string | Yes | Email subject line |
| `body` | string | No | Email body (HTML or plain text) |
| `from_name` | string | No | Sender display name |
| `template_id` | string | No | Keplars template ID |
| `params` | object | No | Template variables |

**Success response:**

```json
{
  "ok": true,
  "data": {
    "id": "msg_...",
    "status": "queued"
  }
}
```

**Error response:**

```json
{
  "ok": false,
  "error": "Missing required fields: to, from, subject"
}
```

## ⚙️ Configuration

| Variable | Description | Required |
| --- | --- | --- |
| `KEPLARS_API_KEY` | Your Keplars API key (`kms_...`) | Yes |
| `KEPLARS_PRIORITY` | Delivery priority: `instant`, `high`, `async`, `bulk` | No (default: `high`) |

## 🚀 Deployment

1. Create a new Appwrite Function
2. Add the environment variables above
3. Deploy the function

**Example request:**

```bash
curl -X POST https://[REGION].appwrite.io/v1/functions/[FUNCTION_ID]/executions \
  -H "X-Appwrite-Project: [PROJECT_ID]" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "from": "hello@yourdomain.com",
    "subject": "Welcome!",
    "body": "<h1>Welcome!</h1><p>Thanks for signing up.</p>"
  }'
```

## 📦 Priority Reference

| Priority | Delivery | Use case |
| --- | --- | --- |
| `instant` | 0-5 seconds | OTP, auth codes |
| `high` | 0-30 seconds | Password reset, alerts |
| `async` | 0-5 minutes | Welcome emails, notifications |
| `bulk` | Background | Newsletters, campaigns |
