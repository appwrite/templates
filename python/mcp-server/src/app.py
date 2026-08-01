"""
Example hosted MCP tools for Appwrite Functions.

Edit this file when building your own server.
Do not name it `server.py` — that conflicts with the Open Runtimes runtime module.

To call Appwrite APIs from a tool, inject ``ctx: Context`` and read the
dynamic API key from inbound headers:

    from mcp.server.mcpserver import Context

    @server.tool(description="List users (needs users.read scope).")
    def list_users(ctx: Context) -> dict:
        api_key = (ctx.headers or {}).get("x-appwrite-key")
        ...
"""

from __future__ import annotations

import os

from mcp.server.mcpserver import MCPServer

server = MCPServer(
    name=os.environ.get("MCP_SERVER_NAME") or "appwrite-hosted-mcp",
    version="0.1.0",
    instructions=(
        "Stateless MCP on Appwrite Functions. "
        "Tools must finish within ~25s (30s domain hard-cap)."
    ),
)


@server.tool(description="Echo text back — verifies the MCP transport works end-to-end.")
def echo(text: str) -> str:
    return text


@server.tool(description="Add two numbers.")
def add(a: float, b: float) -> float:
    return a + b
