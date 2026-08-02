#!/usr/bin/env python3
"""Fail if osv-scanner JSON contains moderate+ (or unknown-severity) advisories.

Reads osv-scanner --format json on stdin.
Exits 0 when clean, 1 when moderate+ findings are present.
"""

from __future__ import annotations

import json
import sys

RANK = {"CRITICAL": 4, "HIGH": 3, "MODERATE": 2, "MEDIUM": 2, "LOW": 1, "UNKNOWN": 2}
MIN_RANK = RANK["MODERATE"]


def severity_of(vuln: dict) -> str:
    db = vuln.get("database_specific") or {}
    sev = str(db.get("severity") or db.get("cvss_severity") or "").upper()
    if sev in RANK:
        return sev
    for entry in vuln.get("severity") or []:
        score = entry.get("score")
        try:
            if isinstance(score, (int, float)):
                n = float(score)
            else:
                continue
            if n >= 9:
                return "CRITICAL"
            if n >= 7:
                return "HIGH"
            if n >= 4:
                return "MODERATE"
            if n >= 0:
                return "LOW"
        except (TypeError, ValueError):
            continue
    return "UNKNOWN"


def main() -> int:
    raw = sys.stdin.read().strip()
    data = json.loads(raw or "{}")
    findings = []
    for result in data.get("results", []):
        for pkg in result.get("packages", []):
            name = (pkg.get("package") or {}).get("name", "?")
            version = (pkg.get("package") or {}).get("version", "?")
            for vuln in pkg.get("vulnerabilities", []):
                sev = severity_of(vuln)
                if RANK.get(sev, 2) < MIN_RANK:
                    continue
                findings.append(
                    f"{name}@{version} {vuln.get('id', '?')} ({sev})"
                )

    if not findings:
        return 0

    print("Moderate+ vulnerabilities:")
    for line in findings:
        print(f"  {line}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
