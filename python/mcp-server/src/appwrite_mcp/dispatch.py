"""Two-leg MCP dispatcher for Appwrite Functions (buffered request/response).

Appwrite never runs a Starlette lifespan, so ``StreamableHTTPSessionManager``
is unusable here. Instead we route on the ``MCP-Protocol-Version`` header:

* modern (``2026-07-28``) → ``handle_modern_request`` (ASGI-shaped, no task group)
* legacy handshake eras   → ``serve_one`` + born-ready ``Connection.from_envelope``

Both legs work with a fresh event loop per request and with Appwrite's
persistent gunicorn worker loop.
"""

from __future__ import annotations

import asyncio
import json
import os
from collections.abc import Mapping
from dataclasses import dataclass, field
from typing import Any

import anyio
from mcp.server._streamable_http_modern import handle_modern_request
from mcp.server.connection import Connection
from mcp.server.lowlevel import Server
from mcp.server.mcpserver import MCPServer
from mcp.server.runner import modern_error_data, serve_one
from mcp.server.transport_security import TransportSecuritySettings
from mcp.shared.exceptions import NoBackChannelError
from mcp.shared.message import ServerMessageMetadata
from mcp.shared.transport_context import TransportContext
from mcp_types.version import HANDSHAKE_PROTOCOL_VERSIONS
from starlette.requests import Request

_FALLBACK_LEGACY_VERSION = "2025-06-18"
_SECURITY = TransportSecuritySettings(enable_dns_rebinding_protection=False)


@dataclass
class BufferedDispatchContext:
    """Structural ``DispatchContext`` for one buffered request.

    Back-channel is closed by construction — Appwrite cannot hold an SSE stream
    open for server-initiated requests or progress notifications.
    """

    transport: TransportContext
    request_id: Any
    message_metadata: Any
    progress_token: Any = None
    cancel_requested: anyio.Event = field(default_factory=anyio.Event)
    can_send_request: bool = field(default=False, init=False)

    async def send_raw_request(
        self,
        method: str,
        params: Mapping[str, Any] | None,
        opts: Any = None,
    ) -> dict[str, Any]:
        raise NoBackChannelError(method)

    async def notify(
        self,
        method: str,
        params: Mapping[str, Any] | None,
        opts: Any = None,
    ) -> None:
        return None

    async def progress(
        self,
        progress: float,
        total: float | None = None,
        message: str | None = None,
    ) -> None:
        return None


def _lowlevel(server: MCPServer) -> Server[Any]:
    return server._lowlevel_server  # noqa: SLF001 — public API is ASGI-only


def _asgi_scope(
    *,
    method: str,
    path: str,
    headers: dict[str, str],
    body: bytes,
    scheme: str = "https",
    host: str = "appwrite",
) -> dict[str, Any]:
    raw = [(k.lower().encode("latin-1"), v.encode("latin-1")) for k, v in headers.items()]
    raw.append((b"content-length", str(len(body)).encode()))
    return {
        "type": "http",
        "asgi": {"version": "3.0", "spec_version": "2.3"},
        "http_version": "1.1",
        "method": method,
        "scheme": scheme,
        "path": path,
        "raw_path": path.encode(),
        "query_string": b"",
        "root_path": "",
        "headers": raw,
        "client": ("0.0.0.0", 0),
        "server": (host, 443 if scheme == "https" else 80),
        "state": {},
    }


def _sanitize_tool_error_body(body: bytes) -> bytes:
    """Strip exception detail from isError tool results unless MCP_DEBUG is set."""
    if os.environ.get("MCP_DEBUG"):
        return body
    try:
        payload = json.loads(body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return body
    if not isinstance(payload, dict):
        return body
    result = payload.get("result")
    if not isinstance(result, dict) or not result.get("isError"):
        return body
    content = result.get("content")
    if not isinstance(content, list) or not content:
        return body
    first = content[0]
    if not isinstance(first, dict) or first.get("type") != "text":
        return body
    text = first.get("text") or ""
    if not text.startswith("Error executing tool "):
        return body
    # "Error executing tool boom: kaboom" → keep tool name, drop detail
    head, _, _rest = text.partition(": ")
    first["text"] = f"{head}: tool failed"
    return json.dumps(payload, separators=(",", ":")).encode()


async def _serve_modern(
    server: MCPServer,
    scope: dict[str, Any],
    body: bytes,
) -> tuple[int, dict[str, str], bytes]:
    delivered = False

    async def receive() -> dict[str, Any]:
        nonlocal delivered
        if not delivered:
            delivered = True
            return {"type": "http.request", "body": body, "more_body": False}
        # Buffered runtime — never disconnect mid-handler.
        await asyncio.sleep(3600)
        return {"type": "http.disconnect"}

    cap: dict[str, Any] = {"status": 500, "headers": {}, "body": b""}

    async def send(message: dict[str, Any]) -> None:
        if message["type"] == "http.response.start":
            cap["status"] = message["status"]
            cap["headers"] = {
                k.decode("latin-1"): v.decode("latin-1") for k, v in message["headers"]
            }
        elif message["type"] == "http.response.body":
            cap["body"] += message.get("body", b"")

    # json_response=True is required: False can commit text/event-stream after 15s.
    await handle_modern_request(
        _lowlevel(server),
        _SECURITY,
        True,
        None,
        scope,
        receive,
        send,
    )
    return cap["status"], cap["headers"], _sanitize_tool_error_body(cap["body"])


async def _serve_legacy(
    server: MCPServer,
    scope: dict[str, Any],
    message: dict[str, Any],
    protocol_version: str,
) -> tuple[int, dict[str, str], bytes]:
    request_id = message.get("id")
    if request_id is None:
        # Notification (e.g. notifications/initialized) → 202 empty.
        return 202, {}, b""

    request = Request(scope)
    connection = Connection.from_envelope(
        protocol_version,
        {"name": "legacy-client", "version": "0"},
        {},
    )
    dctx = BufferedDispatchContext(
        transport=TransportContext(
            kind="streamable-http",
            can_send_request=False,
            headers=request.headers,
        ),
        request_id=request_id,
        message_metadata=ServerMessageMetadata(request_context=request),
    )
    try:
        result = await serve_one(
            _lowlevel(server),
            dctx,
            message.get("method"),
            message.get("params"),
            connection=connection,
            lifespan_state=None,
        )
        payload: dict[str, Any] = {"jsonrpc": "2.0", "id": request_id, "result": result}
    except Exception as exc:  # noqa: BLE001 — map to JSON-RPC error
        error = modern_error_data(exc)
        payload = {
            "jsonrpc": "2.0",
            "id": request_id,
            "error": error.model_dump(mode="json", by_alias=True, exclude_none=True),
        }

    body = json.dumps(payload, separators=(",", ":")).encode()
    return 200, {"content-type": "application/json"}, _sanitize_tool_error_body(body)


async def dispatch(
    server: MCPServer,
    *,
    method: str,
    path: str,
    headers: dict[str, str],
    body: bytes,
    scheme: str = "https",
    host: str = "appwrite",
) -> tuple[int, dict[str, str], bytes]:
    """Route one buffered HTTP request to the correct MCP protocol leg.

    Returns ``(status, response_headers, body_bytes)``.
    """
    headers = {k.lower(): v for k, v in headers.items()}
    # Modern entry hard-requires these; synthesize if the client omitted them.
    headers.setdefault("accept", "application/json, text/event-stream")
    headers["content-type"] = "application/json"
    headers.setdefault("host", host)

    scope = _asgi_scope(
        method=method,
        path=path or "/",
        headers=headers,
        body=body,
        scheme=scheme,
        host=host,
    )

    protocol_version = headers.get("mcp-protocol-version")
    if protocol_version is not None and protocol_version not in HANDSHAKE_PROTOCOL_VERSIONS:
        return await _serve_modern(server, scope, body)

    try:
        message = json.loads(body) if body.strip() else None
    except json.JSONDecodeError as exc:
        err = {
            "jsonrpc": "2.0",
            "id": None,
            "error": {"code": -32700, "message": f"Parse error: {exc}"},
        }
        return 400, {"content-type": "application/json"}, json.dumps(err).encode()

    if not isinstance(message, dict):
        err = {
            "jsonrpc": "2.0",
            "id": None,
            "error": {"code": -32700, "message": "Empty or non-object request body"},
        }
        return 400, {"content-type": "application/json"}, json.dumps(err).encode()

    # Batches are not supported on the legacy one-shot path.
    negotiated = (
        protocol_version
        if protocol_version in HANDSHAKE_PROTOCOL_VERSIONS
        else _FALLBACK_LEGACY_VERSION
    )
    # Prefer the version the client asked for in initialize params when present.
    if message.get("method") == "initialize":
        params = message.get("params") or {}
        if isinstance(params, dict):
            asked = params.get("protocolVersion")
            if asked in HANDSHAKE_PROTOCOL_VERSIONS:
                negotiated = asked

    return await _serve_legacy(server, scope, message, negotiated)
