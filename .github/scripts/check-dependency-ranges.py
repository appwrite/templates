#!/usr/bin/env python3
"""Reject template dependencies that can silently cross a major-version boundary."""

from __future__ import annotations

import json
import re
import sys
import tomllib
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SEMVER = r"\d+(?:\.\d+){1,2}(?:[-+][0-9A-Za-z.-]+)?"
errors: list[str] = []


def fail(path: Path, dependency: str, constraint: str) -> None:
    errors.append(f"{path.relative_to(ROOT)}: {dependency} has an unsafe constraint: {constraint}")


def version_tuple(version: str) -> tuple[int, int, int]:
    parts = version.split("-", 1)[0].split("+", 1)[0].split(".")
    return tuple(int(part) for part in (parts + ["0", "0"])[:3])


def caret_upper_bound(version: str) -> tuple[int, int, int]:
    major, minor, patch = version_tuple(version)
    if major:
        return major + 1, 0, 0
    if minor:
        return 0, minor + 1, 0
    return 0, 0, patch + 1


# npm and Bun use caret ranges. Their committed lockfiles keep current installs reproducible.
for path in sorted([*ROOT.glob("node*/*/package.json"), *ROOT.glob("bun/*/package.json")]):
    manifest = json.loads(path.read_text())
    lock = path.with_name("bun.lock" if path.parts[-3] == "bun" else "package-lock.json")
    if not lock.exists():
        errors.append(f"{path.relative_to(ROOT)}: missing {lock.name}")
    for section in ("dependencies", "devDependencies", "optionalDependencies"):
        for name, constraint in manifest.get(section, {}).items():
            if not re.fullmatch(rf"\^{SEMVER}", constraint):
                fail(path, name, constraint)

# Pub caret constraints stay below the next breaking version according to Dart semver rules.
for path in sorted(ROOT.glob("dart/*/pubspec.yaml")):
    section = None
    for line in path.read_text().splitlines():
        if line in ("dependencies:", "dev_dependencies:"):
            section = line[:-1]
            continue
        if line and not line.startswith(" "):
            section = None
        if section and (match := re.fullmatch(rf"  ([\w-]+): (\^{SEMVER})", line)) is None and line.strip():
            fail(path, line.strip().split(":", 1)[0], line.strip())

# Python has no caret operator, so require both a lower bound and an exclusive upper bound.
for path in sorted([*ROOT.glob("python/*/requirements.txt"), *ROOT.glob("python-ml/*/requirements.txt")]):
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        match = re.fullmatch(rf"([A-Za-z0-9_.-]+)>=({SEMVER}),<({SEMVER})", line)
        if not match or version_tuple(match.group(3)) != caret_upper_bound(match.group(2)):
            fail(path, line.split("=", 1)[0], line)

# Composer's caret and Ruby's explicit upper bounds permit compatible updates only.
for path in sorted(ROOT.glob("php/*/composer.json")):
    for name, constraint in json.loads(path.read_text()).get("require", {}).items():
        if name == "php" or name.startswith("ext-"):
            continue
        if not re.fullmatch(rf"\^{SEMVER}", constraint):
            fail(path, name, constraint)

for path in sorted(ROOT.glob("ruby/*/Gemfile")):
    for line in path.read_text().splitlines():
        if not line.strip().startswith("gem "):
            continue
        match = re.match(r"gem ['\"]([^'\"]+)['\"](.*)", line.strip())
        versions = re.findall(SEMVER, match.group(2)) if match else []
        if not match or len(versions) != 2 or version_tuple(versions[1]) != caret_upper_bound(versions[0]):
            fail(path, match.group(1) if match else "gem", line.strip())

# Cargo's plain versions are caret requirements. Reject wildcards and unbounded inequalities.
for path in sorted(ROOT.glob("rust/*/Cargo.toml")):
    dependencies = tomllib.loads(path.read_text()).get("dependencies", {})
    for name, value in dependencies.items():
        constraint = value if isinstance(value, str) else value.get("version", "")
        if not re.fullmatch(SEMVER, constraint):
            fail(path, name, constraint)

# NuGet ranges must have an upper bound; an exact version is also safe.
for path in sorted(ROOT.glob("dotnet/*/*.csproj")):
    for package in ET.parse(path).iterfind(".//PackageReference"):
        constraint = package.get("Version", "")
        exact = re.fullmatch(SEMVER, constraint)
        bounded = re.fullmatch(rf"[\[(]({SEMVER}),({SEMVER})[\])]", constraint)
        if not exact and (not bounded or version_tuple(bounded.group(2)) != caret_upper_bound(bounded.group(1))):
            fail(path, package.get("Include", "package"), constraint)

# Maven coordinates, Go modules, and URL imports have no portable caret syntax here. Require a
# concrete version; Go major versions are additionally encoded in v2+ module paths.
for path in sorted(ROOT.glob("*/*/deps.gradle")):
    for group, artifact, version in re.findall(r"['\"]([^:'\"]+):([^:'\"]+):([^'\"]+)['\"]", path.read_text()):
        if not re.fullmatch(SEMVER, version):
            fail(path, f"{group}:{artifact}", version)

for path in sorted(ROOT.glob("go/*/go.mod")):
    text = path.read_text()
    dependencies = re.findall(
        r"^\s*(?:require\s+)?([^\s]+)\s+(v[^\s]+)(?:\s+//.*)?$",
        text,
        re.MULTILINE,
    )
    if "require " in text and not dependencies:
        errors.append(f"{path.relative_to(ROOT)}: no Go dependencies could be parsed")
    for module, version in dependencies:
        if not re.fullmatch(rf"v{SEMVER}", version):
            fail(path, module, version)

for path in sorted(ROOT.glob("deno/*/src/*")):
    if path.suffix != ".ts":
        continue
    for url in re.findall(r"from\s+[\"'](https://[^\"']+)", path.read_text()):
        if "@" not in url:
            fail(path, url, "missing URL version")

for path in sorted(ROOT.glob("swift/*/Package.swift")):
    for declaration in re.findall(r"\.package\([^\n]+", path.read_text()):
        if ".upToNextMajor(" not in declaration and ".exact(" not in declaration and "revision:" not in declaration:
            fail(path, "Swift package", declaration)

if errors:
    print("\n".join(errors), file=sys.stderr)
    sys.exit(1)

print("All template dependencies are bounded below the next breaking version.")
