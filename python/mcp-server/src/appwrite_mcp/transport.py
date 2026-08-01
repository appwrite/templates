# Map Appwrite Function req/res <-> MCP Streamable HTTP (JSON mode).

from __future__ import annotations

import asyncio
import json
import os
from typing import Any

from mcp.server.mcpserver import MCPServer

from .auth import check_auth
from .dispatch import dispatch

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET, DELETE",
    "Access-Control-Allow-Headers": (
        "Content-Type, Accept, Authorization, MCP-Protocol-Version, "
        "Mcp-Session-Id, Mcp-Method, Mcp-Name"
    ),
    "Access-Control-Expose-Headers": "MCP-Protocol-Version",
}


def _merge_headers(*dicts: dict[str, str]) -> dict[str, str]:
    out: dict[str, str] = {}
    for d in dicts:
        out.update(d)
    return out


def _jsonrpc_error(req_id: Any, code: int, message: str) -> dict[str, Any]:
    return {"jsonrpc": "2.0", "id": req_id, "error": {"code": code, "message": message}}


def _read_body(req: Any) -> bytes:
    if hasattr(req, "body_binary") and isinstance(req.body_binary, (bytes, bytearray)):
        return bytes(req.body_binary)
    raw = getattr(req, "body_text", None)
    if isinstance(raw, str) and raw:
        return raw.encode("utf-8")
    body_val = getattr(req, "body", None)
    if isinstance(body_val, (dict, list)):
        return json.dumps(body_val).encode("utf-8")
    if isinstance(body_val, str):
        return body_val.encode("utf-8")
    if isinstance(body_val, (bytes, bytearray)):
        return bytes(body_val)
    return b""


async def handle_http(server: MCPServer, context: Any) -> Any:
    """
    Appwrite Function entry adapter.
    Returns a context.res.* dict (caller must ``return`` it).
    """
    req = context.req
    res = context.res
    method = (req.method or "GET").upper()
    headers = {k.lower(): v for k, v in (req.headers or {}).items()}

    if method == "OPTIONS":
        return res.text("", 204, _merge_headers(CORS_HEADERS))

    # Stateless: no SSE GET stream, no session DELETE
    if method in ("GET", "DELETE"):
        body = _jsonrpc_error(
            None,
            -32000,
            f"{method} not supported on this stateless MCP endpoint "
            "(JSON-mode Streamable HTTP only; use POST).",
        )
        return res.json(
            body,
            405,
            _merge_headers(CORS_HEADERS, {"Allow": "POST, OPTIONS"}),
        )

    if method != "POST":
        body = _jsonrpc_error(None, -32600, f"Unsupported HTTP method: {method}")
        return res.json(
            body,
            405,
            _merge_headers(CORS_HEADERS, {"Allow": "POST, OPTIONS"}),
        )

    ok, auth_err = check_auth(headers)
    if not ok and auth_err is not None:
        return res.json(
            auth_err["body"],
            auth_err["status"],
            _merge_headers(CORS_HEADERS, auth_err.get("headers") or {}),
        )

    accept = headers.get("accept", "")
    if (
        accept
        and "application/json" not in accept
        and "text/event-stream" not in accept
        and "*/*" not in accept
        and os.environ.get("MCP_DEBUG")
    ):
        context.log(f"Unusual Accept header: {accept}")

    raw = _read_body(req)
    path = getattr(req, "path", None) or "/"
    scheme = getattr(req, "scheme", None) or "https"
    host = getattr(req, "host", None) or headers.get("host", "appwrite").split(":")[0]

    timeout = float(os.environ.get("MCP_TOOL_TIMEOUT") or "25")

    try:
        status, out_headers, payload = await asyncio.wait_for(
            dispatch(
                server,
                method=method,
                path=path,
                headers=headers,
                body=raw,
                scheme=scheme,
                host=host,
            ),
            timeout=timeout,
        )
    except asyncio.TimeoutError:
        err = _jsonrpc_error(
            None,
            -32000,
            f"Request timed out after {timeout}s "
            "(Appwrite function domain hard-cap is 30s).",
        )
        return res.json(err, 504, _merge_headers(CORS_HEADERS))

    merged = _merge_headers(CORS_HEADERS, out_headers or {})
    if not payload:
        return res.text("", status, merged)
    if isinstance(payload, str):
        payload = payload.encode("utf-8")
    return res.binary(payload, status, merged)
