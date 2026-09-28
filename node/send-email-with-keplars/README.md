# Send Email with Keplars

Send transactional emails from your Appwrite Function using the [Keplars](https://keplars.com) priority-queue API with instant, high, async, or bulk delivery.

## Usage

### POST /

Send an email.

**Request body:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `to` | string \| string[] | Yes | Recipient email address(es) |
| `from` | string | Yes | Sender address (must be verified in Keplars) |
| `subject` | string | Yes | Email subject line |
| `body` | string | No | Email body (HTML or plain text). Required if `template_id` is not set. |
| `from_name` | string | No | Sender display name |
| `template_id` | string | No | Keplars template ID. Required if `body` is not set. |
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

## Configuration

| Variable | Description | Required |
| --- | --- | --- |
| `KEPLARS_API_KEY` | Your Keplars API key (`kms_...`) | Yes |

## Deployment

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

