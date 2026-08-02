#!/usr/bin/env python3
"""Query the OSV API for Maven (deps.gradle) and Deno URL-pinned dependencies.

Exits non-zero if any unallowlisted vulnerability at moderate+ severity is found.
Writes a markdown summary to $GITHUB_STEP_SUMMARY when set.
"""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ALLOWLIST_PATH = ROOT / ".github" / "audit-allowlist.json"
OSV_QUERY = "https://api.osv.dev/v1/query"
SEVERITY_RANK = {"CRITICAL": 4, "HIGH": 3, "MODERATE": 2, "MEDIUM": 2, "LOW": 1, "UNKNOWN": 2}
MIN_RANK = SEVERITY_RANK["MODERATE"]


def load_allowlist() -> set[tuple[str, str, str]]:
    if not ALLOWLIST_PATH.exists():
        return set()
    data = json.loads(ALLOWLIST_PATH.read_text())
    allowed = set()
    for entry in data.get("allowlist", []):
        allowed.add(
            (
                entry.get("ecosystem", "").lower(),
                entry.get("package", "").lower(),
                entry.get("id", "").upper(),
            )
        )
    return allowed


def osv_query(ecosystem: str, name: str, version: str) -> list[dict]:
    payload = json.dumps(
        {"package": {"ecosystem": ecosystem, "name": name}, "version": version}
    ).encode()
    req = urllib.request.Request(
        OSV_QUERY,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        # Fail closed: an unchecked dependency must not look like a clean audit.
        print(f"OSV query failed for {ecosystem}:{name}@{version}: {exc}", file=sys.stderr)
        raise
    except urllib.error.URLError as exc:
        print(f"OSV query failed for {ecosystem}:{name}@{version}: {exc}", file=sys.stderr)
        raise
    return data.get("vulns", [])


def severity_of(vuln: dict) -> str:
    for sev in vuln.get("severity", []) or []:
        score = sev.get("score") or ""
        # CVSS strings like "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
        if isinstance(score, str) and "CVSS" in score:
            # Rough bucket from base score if present elsewhere
            pass
    db = vuln.get("database_specific") or {}
    sev = (db.get("severity") or db.get("cvss_severity") or "").upper()
    if sev in SEVERITY_RANK:
        return sev
    # Fall back to CVSS score buckets when available
    for sev in vuln.get("severity", []) or []:
        try:
            # Some advisories put numeric score under severity[].score as float-like
            numeric = float(str(sev.get("score", "")).split("/")[0])
            if numeric >= 9.0:
                return "CRITICAL"
            if numeric >= 7.0:
                return "HIGH"
            if numeric >= 4.0:
                return "MODERATE"
            if numeric > 0:
                return "LOW"
        except (TypeError, ValueError):
            continue
    return "UNKNOWN"


def is_allowlisted(allowlist: set, ecosystem: str, package: str, vuln_id: str) -> bool:
    eco = ecosystem.lower()
    pkg = package.lower()
    vid = vuln_id.upper()
    return (eco, pkg, vid) in allowlist or (eco, pkg, "") in allowlist


def find_maven_coords() -> list[tuple[str, str, str, str]]:
    """Return (template, ecosystem, name, version) for deps.gradle files."""
    results = []
    pattern = re.compile(
        r"""['"](?P<group>[\w.\-]+):(?P<artifact>[\w.\-]+):(?P<version>[\w.\-+]+)['"]"""
    )
    for path in sorted(ROOT.glob("*/*/deps.gradle")):
        text = path.read_text()
        template = str(path.parent.relative_to(ROOT))
        for match in pattern.finditer(text):
            name = f"{match.group('group')}:{match.group('artifact')}"
            results.append((template, "Maven", name, match.group("version")))
    return results


def find_deno_coords() -> list[tuple[str, str, str, str]]:
    """Map Deno URL pins to OSV npm/JSR queries where possible."""
    results = []
    url_re = re.compile(
        r"""https://(?:esm\.sh|cdn\.skypack\.dev)/(?P<name>@?[^@/"']+)@(?P<version>[^/"']+)"""
    )
    deno_land_re = re.compile(
        r"""https://deno\.land/(?:x|std)@?(?P<name>[^@/"']*)@(?P<version>[^/"']+)"""
    )
    jose_re = re.compile(
        r"""https://deno\.land/x/jose@(?P<version>[^/"']+)"""
    )
    appwrite_re = re.compile(
        r"""https://deno\.land/x/appwrite@(?P<version>[^/"']+)"""
    )

    for path in sorted((ROOT / "deno").glob("*/src/**/*.ts")):
        text = path.read_text()
        template = str(path.parents[1].relative_to(ROOT)) if path.parents[1].name != "src" else str(path.parent.parent.relative_to(ROOT))
        # Prefer template root: deno/<template>
        parts = path.relative_to(ROOT).parts
        template = f"{parts[0]}/{parts[1]}"

        for match in url_re.finditer(text):
            results.append((template, "npm", match.group("name"), match.group("version")))

        for match in appwrite_re.finditer(text):
            # Appwrite Deno SDK mirrors npm node-appwrite loosely; query as npm appwrite when possible
            results.append((template, "npm", "node-appwrite", match.group("version")))

        for match in jose_re.finditer(text):
            # jose on deno.land/x maps to npm jose
            results.append((template, "npm", "jose", match.group("version").lstrip("v")))

        # std library — skip OSV npm mapping; flag version for visibility only if needed
        _ = deno_land_re

    # Deduplicate
    seen = set()
    unique = []
    for item in results:
        if item in seen:
            continue
        seen.add(item)
        unique.append(item)
    return unique


def main() -> int:
    allowlist = load_allowlist()
    targets = find_maven_coords() + find_deno_coords()
    findings = []

    for template, ecosystem, name, version in targets:
        vulns = osv_query(ecosystem, name, version)
        for vuln in vulns:
            sev = severity_of(vuln)
            if SEVERITY_RANK.get(sev, 2) < MIN_RANK:
                continue
            vuln_id = vuln.get("id", "UNKNOWN")
            if is_allowlisted(allowlist, ecosystem, name, vuln_id):
                continue
            findings.append(
                {
                    "template": template,
                    "ecosystem": ecosystem,
                    "package": name,
                    "version": version,
                    "id": vuln_id,
                    "severity": sev,
                    "summary": (vuln.get("summary") or "").split("\n")[0][:120],
                }
            )

    lines = ["## OSV audit (Maven / Deno)", ""]
    if not findings:
        lines.append("No moderate+ vulnerabilities found.")
        print("\n".join(lines))
        summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
        if summary_path:
            Path(summary_path).write_text("\n".join(lines) + "\n")
        return 0

    lines.append("| Template | Ecosystem | Package | Version | ID | Severity | Summary |")
    lines.append("| --- | --- | --- | --- | --- | --- | --- |")
    for f in findings:
        lines.append(
            f"| `{f['template']}` | {f['ecosystem']} | `{f['package']}` | `{f['version']}` | `{f['id']}` | {f['severity']} | {f['summary']} |"
        )
    report = "\n".join(lines)
    print(report)
    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_path:
        Path(summary_path).write_text(report + "\n")

    print(f"\nFound {len(findings)} unallowlisted moderate+ advisories.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
