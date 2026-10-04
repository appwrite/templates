# Optional bearer-token gate for the hosted MCP endpoint.

from __future__ import annotations

import hmac
import os
from typing import Any

import jwt

from . import oauth


def auth_mode() -> str:
    return (os.environ.get("MCP_AUTH_MODE") or "none").strip().lower()


def expected_token() -> str:
    return os.environ.get("MCP_AUTH_TOKEN") or ""


def check_auth(headers: dict[str, str], resource: str) -> tuple[bool, dict[str, Any] | None]:
    """
    Returns (ok, error_payload).
    error_payload is a dict suitable for context.res.json(..., 401, headers)
    when auth fails; None when ok.
    """
    mode = auth_mode()
    if mode in ("", "none", "open", "false", "0"):
        return True, None

    if mode == "oauth":
        return _check_oauth(headers, resource)

    if mode != "bearer":
        return False, {
            "body": {
                "jsonrpc": "2.0",
                "id": None,
                "error": {
                    "code": -32000,
                    "message": f"Unsupported MCP_AUTH_MODE: {mode}",
                },
            },
            "status": 500,
            "headers": {},
        }

    token = expected_token()
    if not token:
        return False, {
            "body": {
                "jsonrpc": "2.0",
                "id": None,
                "error": {
                    "code": -32000,
                    "message": "MCP_AUTH_MODE=bearer but MCP_AUTH_TOKEN is empty",
                },
            },
            "status": 500,
            "headers": {},
        }

    auth = (headers.get("authorization") or "").strip()
    prefix = "Bearer "
    if not auth.startswith(prefix):
        return False, _unauthorized("Missing or invalid Authorization header")

    provided = auth[len(prefix) :].strip()
    if not hmac.compare_digest(provided, token):
        return False, _unauthorized("Invalid bearer token")

    return True, None


def _check_oauth(headers: dict[str, str], resource: str) -> tuple[bool, dict[str, Any] | None]:
    auth = (headers.get("authorization") or "").strip()
    prefix = "Bearer "
    if not auth.startswith(prefix):
        return False, _unauthorized("Missing or invalid Authorization header", oauth.challenge(resource))

    try:
        oauth.verify(auth[len(prefix) :].strip(), resource)
    except jwt.PyJWTError as error:
        return False, _unauthorized(f"Invalid access token: {error}", oauth.challenge(resource, "invalid_token"))

    return True, None


def _unauthorized(message: str, challenge: str = "Bearer") -> dict[str, Any]:
    return {
        "body": {
            "jsonrpc": "2.0",
            "id": None,
            "error": {"code": -32001, "message": message},
        },
        "status": 401,
        "headers": {"WWW-Authenticate": challenge},
    }
