#!/usr/bin/env python3
"""Audit Maven coords in */*/deps.gradle via osv-scanner."""

from __future__ import annotations

import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
# Quoted Gradle coords: 'group:artifact:version'
COORD = re.compile(r"['\"]([^:'\"]+):([^:'\"]+):([^'\"]+)['\"]")


def main() -> int:
    failed = 0
    for path in sorted(ROOT.glob("*/*/deps.gradle")):
        packages = [
            {"package": {"name": f"{g}:{a}", "version": v, "ecosystem": "Maven"}}
            for g, a, v in COORD.findall(path.read_text())
        ]
        if not packages:
            continue

        template = path.parent.relative_to(ROOT)
        print(f"::group::{template}", flush=True)
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as fh:
            json.dump({"results": [{"packages": packages}]}, fh)
            lockfile = fh.name
        try:
            if subprocess.call(
                [
                    "osv-scanner",
                    "scan",
                    "source",
                    f"--lockfile=osv-scanner:{lockfile}",
                ]
            ):
                failed = 1
        finally:
            Path(lockfile).unlink(missing_ok=True)
            print("::endgroup::", flush=True)

    return failed


if __name__ == "__main__":
    sys.exit(main())
