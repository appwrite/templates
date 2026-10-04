# OAuth 2.1 resource-server side of MCP auth, backed by the project's Appwrite OAuth2 server.

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import jwt
from appwrite.client import Client

METADATA_PATH = "/.well-known/oauth-protected-resource"
CONSENT_PATH = "/oauth/consent"
JWKS_TIMEOUT = 5

_jwks: jwt.PyJWKClient | None = None


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
        _jwks = jwt.PyJWKClient(f"{issuer()}/.well-known/jwks.json", cache_keys=True, timeout=JWKS_TIMEOUT)

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


def client(headers: Any) -> Client:
    """Appwrite client acting as the user who authorized the MCP client; permissions apply to every call."""
    authorization = (headers or {}).get("authorization", "")
    return (
        Client()
        .set_endpoint(os.environ["APPWRITE_FUNCTION_API_ENDPOINT"])
        .set_project(os.environ["APPWRITE_FUNCTION_PROJECT_ID"])
        .add_header("Authorization", authorization)
    )
