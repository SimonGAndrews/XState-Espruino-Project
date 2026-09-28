#!/usr/bin/env python3
"""Audit the Profile 1 compatibility register and Stately corpus."""

from __future__ import annotations

import json
from pathlib import Path
import re


PROJECT = Path(__file__).resolve().parents[1]
REGISTER = PROJECT / "docs" / "compatibility" / "register.json"
SPECIFICATION = PROJECT / "docs" / "specification.md"
MATRIX = PROJECT / "tests" / "conformance-matrix.md"
CORPUS = PROJECT / "docs" / "compatibility"
ASSESSMENTS = {
    "accepted-unchanged",
    "accepted-after-normalization",
    "intentionally-unsupported",
    "requires-design-decision",
}


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def package_version(path: Path) -> str:
    package = json.loads(path.read_text(encoding="utf-8"))
    require(package.get("lockfileVersion") is not None, f"{path}: not a lockfile")
    version = package.get("packages", {}).get("node_modules/xstate", {}).get("version")
    require(isinstance(version, str), f"{path}: xstate is not locked")
    return version


def main() -> None:
    data = json.loads(REGISTER.read_text(encoding="utf-8"))
    specification = SPECIFICATION.read_text(encoding="utf-8")
    matrix = MATRIX.read_text(encoding="utf-8")

    headings = dict(re.findall(r"^### (XFC-CD-\d{3}): (.+)$", specification, re.M))
    registered = {entry["id"]: entry for entry in data["intentionalDifferences"]}
    require(registered.keys() == headings.keys(), "intentional-difference IDs drifted")
    known_cases = set(re.findall(r"`(XFC-CF-[A-Z]+-\d{3})`", matrix))
    for difference_id, entry in registered.items():
        require(entry["title"] == headings[difference_id], f"{difference_id}: title drift")
        require(entry["caseIds"], f"{difference_id}: no conformance case")
        require(set(entry["caseIds"]) <= known_cases, f"{difference_id}: unknown case")

    references = data["references"]
    for name, expected in (("primary", "5.33.2"), ("secondary", "4.38.3")):
        reference = references[name]
        require(reference["version"] == expected, f"{name}: wrong declared version")
        lockfile = (REGISTER.parent / reference["package"]).resolve()
        require(package_version(lockfile) == expected, f"{name}: lockfile version mismatch")
        require("latest" not in json.dumps(reference).lower(), f"{name}: unpinned latest")

    corpus_dirs = {path.name for path in CORPUS.iterdir() if path.is_dir()}
    examples = {entry["id"]: entry for entry in data["statelyExamples"]}
    require(examples.keys() == corpus_dirs, "Stately corpus directory/register drift")
    for example_id, entry in examples.items():
        directory = CORPUS / example_id
        readme = (directory / "README.md").read_text(encoding="utf-8")
        require(entry["producer"], f"{example_id}: missing producer")
        require(entry["captured"], f"{example_id}: missing capture date")
        require(
            entry["producerVersion"] or entry["versionStatus"],
            f"{example_id}: missing producer version status",
        )
        require(entry["assessment"] in ASSESSMENTS, f"{example_id}: invalid assessment")
        require(entry["adaptations"], f"{example_id}: adaptations not recorded")
        require(set(entry["caseIds"]) <= known_cases, f"{example_id}: unknown case")
        require("## Provenance" in readme, f"{example_id}: no provenance section")
        require("## Profile 1 Assessment" in readme, f"{example_id}: no assessment section")
        for export in entry["exports"]:
            source = directory / export
            require(source.is_file(), f"{example_id}: missing {export}")
            text = source.read_text(encoding="utf-8")
            require("createMachine" in text, f"{example_id}/{export}: no machine")

    for item in data["legacyEvidence"]:
        require(item["classification"] in {"legacy-evidence", "compatibility-evidence"},
                f"{item['id']}: invalid legacy classification")
        require(item["revision"], f"{item['id']}: missing revision")
        require(set(item["adoptedCaseIds"]) <= known_cases, f"{item['id']}: unknown case")
        if item["adoptedCaseIds"]:
            require(item.get("expectedResult"), f"{item['id']}: adopted without result")

    areas = data["differentialCoverage"]
    require(len(areas) == 10, "differential coverage register is incomplete")
    for item in areas:
        require(item["reference"] in {"xstate@5.33.2", "xstate@4.38.3"},
                f"{item['area']}: unpinned reference")
        require((REGISTER.parent / item["trace"]).resolve().is_file(),
                f"{item['area']}: missing reference trace")
        require((REGISTER.parent / item["expected"]).resolve().is_file(),
                f"{item['area']}: missing reviewed result")
        require(set(item["caseIds"]) <= known_cases, f"{item['area']}: unknown case")
    for item in data["differentialExclusions"]:
        require(item["reason"], f"{item['area']}: missing exclusion reason")
        require(set(item["caseIds"]) <= known_cases, f"{item['area']}: unknown case")

    print(f"Intentional differences: {len(registered)}")
    print(f"Stately examples: {len(examples)}")
    print(f"Pinned references: {references['primary']['version']}, "
          f"{references['secondary']['version']}")
    print(f"Legacy evidence sources: {len(data['legacyEvidence'])}")
    print(f"Differential areas: {len(areas)}")
    print(f"Differential exclusion groups: {len(data['differentialExclusions'])}")
    print("Compatibility governance: PASS")


if __name__ == "__main__":
    main()
