# Hello World Function

Serves a simple "Hello, World!" message. If accessed via GET, it serves an HTML page, otherwise, it returns a JSON response.
### Function API

- `GET` - Returns a HTML page with a greeting.

- `POST` - Returns a JSON object with shape:
```json
{
  "message": "Hello, World! 👋"
}
```