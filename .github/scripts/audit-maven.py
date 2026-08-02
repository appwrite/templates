#!/usr/bin/env python3
"""Audit Maven coordinates declared in */*/deps.gradle via the OSV API.

Exits non-zero if any vulnerability is found, or if an OSV query fails.
"""

from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OSV_QUERY = "https://api.osv.dev/v1/query"
COORD_RE = __import__("re").compile(
    r"""['"](?P<group>[\w.\-]+):(?P<artifact>[\w.\-]+):(?P<version>[\w.\-+]+)['"]"""
)


def osv_query(name: str, version: str) -> list[dict]:
    payload = json.dumps(
        {"package": {"ecosystem": "Maven", "name": name}, "version": version}
    ).encode()
    req = urllib.request.Request(
        OSV_QUERY,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode()).get("vulns", [])
    except (urllib.error.HTTPError, urllib.error.URLError) as exc:
        print(f"OSV query failed for {name}@{version}: {exc}", file=sys.stderr)
        raise


def main() -> int:
    findings = []
    for path in sorted(ROOT.glob("*/*/deps.gradle")):
        template = str(path.parent.relative_to(ROOT))
        for match in COORD_RE.finditer(path.read_text()):
            name = f"{match.group('group')}:{match.group('artifact')}"
            version = match.group("version")
            for vuln in osv_query(name, version):
                findings.append(
                    f"{template}: {name}@{version} -> {vuln.get('id', '?')}: "
                    f"{(vuln.get('summary') or '').splitlines()[0][:120]}"
                )

    if not findings:
        print("No Maven vulnerabilities found in deps.gradle files.")
        return 0

    print("Maven vulnerabilities:")
    for line in findings:
        print(f"  {line}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
