# OAuth 2.1 resource-server side of MCP auth, backed by the project's Appwrite OAuth2 server.

from __future__ import annotations

import os
from contextvars import ContextVar
from pathlib import Path
from typing import Any

import jwt
from appwrite.client import Client
from appwrite.services.users import Users
from mcp.server.mcpserver.exceptions import ToolError

METADATA_PATH = "/.well-known/oauth-protected-resource"
CONSENT_PATH = "/oauth/consent"
JWKS_TIMEOUT = 5
USER_JWT_DURATION = 60

_jwks: jwt.PyJWKClient | None = None

verified_claims: ContextVar[dict[str, Any] | None] = ContextVar("verified_claims", default=None)


def issuer() -> str:
    explicit = os.environ.get("MCP_AUTH_ISSUER")
    if explicit:
        return explicit.rstrip("/")
    endpoint = os.environ["APPWRITE_FUNCTION_API_ENDPOINT"].rstrip("/")
    return f"{endpoint}/oauth2/{os.environ['APPWRITE_FUNCTION_PROJECT_ID']}"


def consent_page() -> str:
    """Sign-in and consent screen for the project's OAuth2 server; set it as the server's authorization URL."""
    html = (Path(__file__).parent / "consent.html").read_text()
    return html.replace("__APPWRITE_ENDPOINT__", os.environ["APPWRITE_FUNCTION_API_ENDPOINT"]).replace(
        "__APPWRITE_PROJECT__", os.environ["APPWRITE_FUNCTION_PROJECT_ID"]
    )


def scopes() -> list[str]:
    return (os.environ.get("MCP_AUTH_SCOPES") or "").split()


def resource(host: str) -> str:
    """Function domains are HTTPS-only, but the executor forwards requests as plain HTTP."""
    return (os.environ.get("MCP_RESOURCE") or f"https://{host}").rstrip("/")


def metadata(resource_url: str) -> dict[str, Any]:
    """RFC 9728 protected resource metadata, pointing MCP clients at the Appwrite OAuth2 server."""
    document: dict[str, Any] = {
        "resource": resource_url,
        "authorization_servers": [issuer()],
        "bearer_methods_supported": ["header"],
    }
    if scopes():
        document["scopes_supported"] = scopes()
    return document


def challenge(resource_url: str, error: str | None = None) -> str:
    parts = [f'resource_metadata="{resource_url}{METADATA_PATH}"']
    if scopes():
        parts.append(f'scope="{" ".join(scopes())}"')
    if error:
        parts.append(f'error="{error}"')
    return "Bearer " + ", ".join(parts)


def verify(token: str, resource_url: str) -> dict[str, Any]:
    """Validate an Appwrite-issued access token (RFC 9068) for this resource. Raises jwt.PyJWTError."""
    global _jwks
    if _jwks is None:
        _jwks = jwt.PyJWKClient(f"{issuer()}/.well-known/jwks.json", timeout=JWKS_TIMEOUT)

    token_type = jwt.get_unverified_header(token).get("typ")
    if not isinstance(token_type, str) or token_type.lower() != "at+jwt":
        raise jwt.InvalidTokenError("Not an OAuth2 access token")

    return jwt.decode(
        token,
        _jwks.get_signing_key_from_jwt(token).key,
        algorithms=["RS256"],
        issuer=issuer(),
        audience=resource_url,
        options={"require": ["exp", "iat", "sub", "aud", "iss"]},
    )


def claims() -> dict[str, Any]:
    """Claims of the access token the transport verified for this request; refuses without one."""
    verified = verified_claims.get()
    if verified is None:
        raise ToolError("Sign-in required: this tool needs MCP_AUTH_MODE=oauth")
    return verified


def require_scope(scope: str) -> None:
    """Fail the tool call unless the user granted this app-defined scope (e.g. ``tasks.read``)."""
    if scope not in claims().get("scope", "").split():
        raise ToolError(f"Missing scope: {scope}")


def user_client(headers: Any) -> Client:
    """Appwrite client acting as the signed-in user, so row permissions apply.

    The function's own key mints a short-lived JWT for the token's user; the access token
    itself carries only app-defined scopes and never reaches Appwrite. Needs the function's
    ``users.write`` execution scope.
    """
    endpoint = os.environ["APPWRITE_FUNCTION_API_ENDPOINT"]
    project = os.environ["APPWRITE_FUNCTION_PROJECT_ID"]
    server = Client().set_endpoint(endpoint).set_project(project).set_key((headers or {}).get("x-appwrite-key", ""))
    user_jwt = Users(server).create_jwt(claims()["sub"], duration=USER_JWT_DURATION)
    return Client().set_endpoint(endpoint).set_project(project).set_jwt(user_jwt.jwt)
