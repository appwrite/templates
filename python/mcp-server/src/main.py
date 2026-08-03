"""Appwrite Function entrypoint — thin adapter around the official MCP SDK."""

from __future__ import annotations

import sys
from pathlib import Path

# Ensure sibling modules (app, appwrite_mcp) resolve under Appwrite's entrypoint layout.
# Note: never name a user module `server` — Open Runtimes already ships server.py.
_SRC = Path(__file__).resolve().parent
if str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))

from app import server  # noqa: E402
from appwrite_mcp import handle_http  # noqa: E402


async def main(context):
    return await handle_http(server, context)
