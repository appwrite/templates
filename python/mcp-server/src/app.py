"""
Example hosted MCP tools for Appwrite Functions.

Edit this file when building your own server.
Do not name it `server.py` — that conflicts with the Open Runtimes runtime module.

With ``MCP_AUTH_MODE=oauth``, tools are your app's API: gate each one on an
app-defined scope with ``oauth.require_scope`` and query Appwrite as the signed-in
user with ``oauth.user_client`` (see ``list_tasks`` below). Otherwise read the
ephemeral API key from inbound headers:

    from mcp.server.mcpserver import Context

    @server.tool(description="List users (needs users.read scope).")
    def list_users(ctx: Context) -> dict:
        api_key = (ctx.headers or {}).get("x-appwrite-key")
        ...
"""

from __future__ import annotations

import os
from typing import Any, TypedDict

from appwrite.query import Query
from appwrite.services.tables_db import TablesDB
from mcp.server.mcpserver import Context, MCPServer

from appwrite_mcp import oauth

TASKS_DATABASE_ID = "main"
TASKS_TABLE_ID = "tasks"


class TaskPage(TypedDict):
    tasks: list[dict[str, Any]]
    next_cursor: str | None

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


@server.tool(description="List the signed-in user's tasks, a page at a time. Pass next_cursor back as cursor for more.")
def list_tasks(ctx: Context, limit: int = 25, cursor: str | None = None) -> TaskPage:
    oauth.require_scope("tasks.read")
    page_size = max(1, min(limit, 100))
    queries = [Query.limit(page_size)]
    if cursor:
        queries.append(Query.cursor_after(cursor))
    rows = TablesDB(oauth.user_client(ctx.headers)).list_rows(TASKS_DATABASE_ID, TASKS_TABLE_ID, queries).to_dict()["rows"]
    tasks = [{**row["data"], "id": row["$id"]} for row in rows]
    return {"tasks": tasks, "next_cursor": tasks[-1]["id"] if len(tasks) == page_size else None}
