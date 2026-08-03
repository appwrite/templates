# 🔌 MCP Server

Expose custom tools to AI clients (Claude Code, Cursor, and other MCP hosts) over HTTPS. Stateless [Model Context Protocol](https://modelcontextprotocol.io/) server on Appwrite Functions — official Python SDK (`mcp==2.0.0`), JSON-RPC over HTTPS. No SSE sessions.

Edit `src/app.py` to register your own tools, deploy, and point Claude Code / Cursor at the function domain.

## 🧰 Usage

### POST /

Accepts MCP Streamable HTTP JSON requests (legacy handshake and modern `2026-07-28`).

**Headers**

| Name                   | Description                                      | Location | Type   | Sample Value   |
| ---------------------- | ------------------------------------------------ | -------- | ------ | -------------- |
| Content-Type           | Must be `application/json`                       | Header   | String | application/json |
| Accept                 | Prefer `application/json, text/event-stream`     | Header   | String | application/json, text/event-stream |
| MCP-Protocol-Version   | Optional. Use `2026-07-28` for the modern path   | Header   | String | 2025-06-18     |
| Authorization          | Required when `MCP_AUTH_MODE=bearer`             | Header   | String | Bearer s3cr3t  |

**Response**

Sample `200` — `initialize`:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2025-06-18",
    "capabilities": { "tools": { "listChanged": true } },
    "serverInfo": { "name": "appwrite-hosted-mcp", "version": "0.1.0" }
  }
}
```

Sample `200` — `tools/call` echo:

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [{ "type": "text", "text": "pong" }]
  }
}
```

Sample `202` — notifications (empty body):

```text
(empty)
```

Sample `401` — bearer auth failure:

```json
{
  "jsonrpc": "2.0",
  "id": null,
  "error": { "code": -32001, "message": "Invalid bearer token" }
}
```

### OPTIONS /

CORS preflight. Returns `204` with `Access-Control-Allow-*` headers.

### GET /, DELETE /

Not supported (no SSE streams, no sessions). Returns `405`.

### Demo tools

| Tool | Arguments        | Returns          |
| ---- | ---------------- | ---------------- |
| echo | `text: string`   | echoed string    |
| add  | `a: float`, `b: float` | sum         |

### Connect a client

After deploy, add the function domain:

```bash
claude mcp add --transport http my-mcp https://<your-function>.appwrite.run
```

Or in Cursor / Claude Desktop `mcp.json`:

```json
{
  "mcpServers": {
    "my-mcp": {
      "url": "https://<your-function>.appwrite.run"
    }
  }
}
```

With bearer auth, set Function env `MCP_AUTH_MODE=bearer` + `MCP_AUTH_TOKEN=...` and pass:

```json
{
  "mcpServers": {
    "my-mcp": {
      "url": "https://<your-function>.appwrite.run",
      "headers": {
        "Authorization": "Bearer your-long-random-secret"
      }
    }
  }
}
```

### Smoke test

```bash
curl -sS -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"0.1.0"}}}' \
  https://<your-function>.appwrite.run
```

### Write a tool

```python
# src/app.py
from mcp.server.mcpserver import MCPServer

server = MCPServer(name="my-mcp", version="0.1.0")

@server.tool(description="Do something useful.")
def my_tool(query: str) -> str:
    return f"got: {query}"
```

Type hints become the tool `inputSchema`. Add `ctx: Context` to read inbound HTTP headers (including Appwrite's dynamic API key `x-appwrite-key`).

Do **not** name the tools module `server.py` — Open Runtimes already ships a top-level `server` module.

### Why this isn't `streamable_http_app()`

Appwrite Functions are short-lived request/response workers. They do not run a Starlette lifespan, so `MCPServer.streamable_http_app()` raises `RuntimeError: Task group is not initialized`. This template drives the SDK's lower-level buffered entry points instead (legacy `serve_one` + modern `handle_modern_request`). Pin `mcp==2.0.0` exactly — those helpers are private and can move.

## ⚙️ Configuration

| Setting           | Value                             |
| ----------------- | --------------------------------- |
| Runtime           | Python (3.12)                     |
| Entrypoint        | `src/main.py`                     |
| Build Commands    | `pip install -r requirements.txt` |
| Permissions       | `any`                             |
| Timeout (Seconds) | 30                                |

## 🔒 Environment Variables

### MCP_SERVER_NAME

Display name returned in `initialize` → `serverInfo.name`.

| Question     | Answer                |
| ------------ | --------------------- |
| Required     | No                    |
| Sample Value | `appwrite-hosted-mcp` |

### MCP_AUTH_MODE

Auth gate for the endpoint. `none` (default) is open; `bearer` requires `Authorization: Bearer <token>`.

| Question     | Answer         |
| ------------ | -------------- |
| Required     | No             |
| Sample Value | `none`         |

### MCP_AUTH_TOKEN

Shared secret when `MCP_AUTH_MODE=bearer`. Compared with `hmac.compare_digest`.

| Question     | Answer              |
| ------------ | ------------------- |
| Required     | Yes (when bearer)   |
| Sample Value | `s3cr3t...token`    |

### MCP_TOOL_TIMEOUT

Soft deadline (seconds) for the whole request, before Appwrite's 30s domain hard-cap.

| Question     | Answer |
| ------------ | ------ |
| Required     | No     |
| Sample Value | `25`   |

### MCP_DEBUG

Set to `1` to keep exception detail in tool `isError` results and log unusual `Accept` headers.

| Question     | Answer |
| ------------ | ------ |
| Required     | No     |
| Sample Value | `1`    |
