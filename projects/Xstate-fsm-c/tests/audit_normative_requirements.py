#!/usr/bin/env python3
"""Inventory and validate Profile 1 normative requirement traceability."""

from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import re
import sys
from collections import Counter
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = SCRIPT_DIR.parent
DEFAULT_SPEC = PROJECT_DIR / "docs" / "specification.md"
DEFAULT_REGISTRY = SCRIPT_DIR / "normative-requirements.json"
DEFAULT_MAPPING = SCRIPT_DIR / "normative-requirement-mapping.json"
DEFAULT_MATRIX = SCRIPT_DIR / "conformance-matrix.md"

KEYWORD_RE = re.compile(r"\bMUST NOT\b|\bMUST\b")
CASE_RE = re.compile(r"\bXFC-CF-[A-Z]+-[0-9]{3}\b")
NORMATIVE_SECTIONS = {
    "Scope",
    "Compatibility Target",
    "Machine Model",
    "Runtime Semantics",
    "Public Interfaces",
    "Host Integration",
    "Validation and Error Behavior",
    "Resource and Performance Requirements",
    "Conformance Requirements",
}


def normalize(text: str) -> str:
    return " ".join(text.split())


def fingerprint(
    section: str,
    subsection: str | None,
    text: str,
    occurrence: int,
    keyword: str,
) -> str:
    material = "\0".join(
        (section, subsection or "", normalize(text), str(occurrence), keyword)
    )
    return hashlib.sha256(material.encode("utf-8")).hexdigest()[:20]


def extract_requirements(spec_path: Path) -> tuple[str, list[dict[str, object]]]:
    source = spec_path.read_text(encoding="utf-8")
    lines = source.splitlines()
    section: str | None = None
    subsection: str | None = None
    in_fence = False
    paragraph: list[tuple[int, str]] = []
    paragraphs: list[tuple[str, str | None, list[tuple[int, str]]]] = []

    def flush() -> None:
        nonlocal paragraph
        if paragraph and section in NORMATIVE_SECTIONS:
            paragraphs.append((section, subsection, paragraph))
        paragraph = []

    for line_number, line in enumerate(lines, start=1):
        stripped = line.strip()
        if stripped.startswith("```"):
            flush()
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        if stripped.startswith("## "):
            flush()
            section = stripped[3:].strip()
            subsection = None
            continue
        if stripped.startswith("### "):
            flush()
            subsection = stripped[4:].strip()
            continue
        if not stripped:
            flush()
            continue
        paragraph.append((line_number, stripped))
    flush()

    requirements: list[dict[str, object]] = []
    for paragraph_section, paragraph_subsection, paragraph_lines in paragraphs:
        text = normalize(" ".join(line for _, line in paragraph_lines))
        occurrence = 0
        for line_number, line in paragraph_lines:
            for match in KEYWORD_RE.finditer(line):
                occurrence += 1
                keyword = match.group(0)
                requirements.append(
                    {
                        "section": paragraph_section,
                        "subsection": paragraph_subsection,
                        "line": line_number,
                        "keyword": keyword,
                        "occurrence": occurrence,
                        "text": text,
                        "fingerprint": fingerprint(
                            paragraph_section,
                            paragraph_subsection,
                            text,
                            occurrence,
                            keyword,
                        ),
                    }
                )

    for index, requirement in enumerate(requirements, start=1):
        requirement["id"] = f"XFC-REQ-{index:04d}"

    return hashlib.sha256(source.encode("utf-8")).hexdigest(), requirements


def build_registry(spec_path: Path) -> dict[str, object]:
    spec_sha256, requirements = extract_requirements(spec_path)
    try:
        source = str(spec_path.relative_to(PROJECT_DIR))
    except ValueError:
        source = str(spec_path)
    return {
        "schemaVersion": 1,
        "source": source,
        "sourceSha256": spec_sha256,
        "extractionRule": "MUST and MUST NOT occurrences outside fenced code in normative sections",
        "requirementCount": len(requirements),
        "requirements": requirements,
    }


def write_registry(registry_path: Path, registry: dict[str, object]) -> None:
    registry_path.write_text(
        json.dumps(registry, indent=2, ensure_ascii=True) + "\n", encoding="utf-8"
    )


def load_json(path: Path) -> dict[str, object]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError(f"cannot read {path}: {error}") from error


def validate_registry(
    expected: dict[str, object], actual: dict[str, object]
) -> list[str]:
    errors: list[str] = []
    if actual.get("schemaVersion") != 1:
        errors.append("registry schemaVersion must be 1")

    expected_requirements = expected["requirements"]
    actual_requirements = actual.get("requirements")
    if not isinstance(actual_requirements, list):
        return errors + ["registry requirements must be an array"]
    if len(actual_requirements) != len(expected_requirements):
        errors.append(
            "normative requirement count changed: "
            f"registry={len(actual_requirements)}, specification={len(expected_requirements)}"
        )

    registered_ids: set[str] = set()
    for index, registered in enumerate(actual_requirements, start=1):
        requirement_id = registered.get("id")
        if not isinstance(requirement_id, str) or not re.fullmatch(
            r"XFC-REQ-[0-9]{4,}", requirement_id
        ):
            errors.append(f"registry entry {index} has invalid id {requirement_id!r}")
        elif requirement_id in registered_ids:
            errors.append(f"registry contains duplicate id {requirement_id}")
        else:
            registered_ids.add(requirement_id)

    registered_fingerprints = [entry.get("fingerprint") for entry in actual_requirements]
    extracted_fingerprints = [entry.get("fingerprint") for entry in expected_requirements]
    matcher = difflib.SequenceMatcher(
        a=registered_fingerprints, b=extracted_fingerprints, autojunk=False
    )
    for tag, old_start, old_end, new_start, new_end in matcher.get_opcodes():
        if tag == "equal":
            continue
        old_entries = actual_requirements[old_start:old_end]
        new_entries = expected_requirements[new_start:new_end]
        paired = min(len(old_entries), len(new_entries)) if tag == "replace" else 0
        for offset in range(paired):
            errors.append(
                f"{old_entries[offset].get('id')} changed near specification line "
                f"{new_entries[offset].get('line')}"
            )
        for old_entry in old_entries[paired:]:
            errors.append(
                f"{old_entry.get('id')} is no longer present in the specification"
            )
        for new_entry in new_entries[paired:]:
            errors.append(
                "unregistered normative requirement near specification line "
                f"{new_entry.get('line')}"
            )
        if len(errors) >= 20:
            errors = errors[:20]
            errors.append("additional registry differences suppressed")
            break
    return errors


def validate_mapping(
    registry: dict[str, object], mapping: dict[str, object], matrix_path: Path
) -> tuple[list[str], dict[str, dict[str, object]]]:
    errors: list[str] = []
    if mapping.get("schemaVersion") != 1:
        errors.append("mapping schemaVersion must be 1")
    requirements = registry.get("requirements", [])
    known_requirements = {entry["id"] for entry in requirements}
    known_cases = set(CASE_RE.findall(matrix_path.read_text(encoding="utf-8")))
    reviewed = mapping.get("reviewed")
    if not isinstance(reviewed, list):
        return ["mapping reviewed must be an array"], {}

    by_id: dict[str, dict[str, object]] = {}
    valid_coverage = {"mapped", "gap", "not-applicable"}
    valid_evidence = {"pass", "partial", "planned", "not-applicable"}
    for item in reviewed:
        if not isinstance(item, dict):
            errors.append("each reviewed mapping must be an object")
            continue
        requirement_id = item.get("id")
        if requirement_id not in known_requirements:
            errors.append(f"unknown requirement id in mapping: {requirement_id!r}")
            continue
        if requirement_id in by_id:
            errors.append(f"duplicate mapping for {requirement_id}")
            continue
        by_id[requirement_id] = item
        if item.get("coverage") not in valid_coverage:
            errors.append(f"{requirement_id} has invalid coverage status")
        if item.get("evidence") not in valid_evidence:
            errors.append(f"{requirement_id} has invalid evidence status")
        case_ids = item.get("caseIds")
        if not isinstance(case_ids, list):
            errors.append(f"{requirement_id} caseIds must be an array")
            continue
        unknown_cases = sorted(set(case_ids) - known_cases)
        if unknown_cases:
            errors.append(
                f"{requirement_id} references unknown cases: {', '.join(unknown_cases)}"
            )
        if item.get("coverage") == "mapped" and not case_ids:
            errors.append(f"{requirement_id} is mapped but has no conformance case")
    return errors, by_id


def print_summary(
    registry: dict[str, object], reviewed_by_id: dict[str, dict[str, object]]
) -> None:
    requirements = registry["requirements"]
    section_totals = Counter(entry["section"] for entry in requirements)
    section_reviewed = Counter(
        entry["section"]
        for entry in requirements
        if entry["id"] in reviewed_by_id
    )
    coverage = Counter(item["coverage"] for item in reviewed_by_id.values())
    evidence = Counter(item["evidence"] for item in reviewed_by_id.values())

    print(f"Normative requirements: {len(requirements)}")
    print(f"Reviewed: {len(reviewed_by_id)}")
    print(f"Pending review: {len(requirements) - len(reviewed_by_id)}")
    print(
        "Coverage: "
        + ", ".join(f"{key}={value}" for key, value in sorted(coverage.items()))
    )
    print(
        "Evidence: "
        + ", ".join(f"{key}={value}" for key, value in sorted(evidence.items()))
    )
    print("By section:")
    for section, total in section_totals.items():
        print(f"  {section}: {section_reviewed[section]}/{total} reviewed")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--spec", type=Path, default=DEFAULT_SPEC)
    parser.add_argument("--registry", type=Path, default=DEFAULT_REGISTRY)
    parser.add_argument("--mapping", type=Path, default=DEFAULT_MAPPING)
    parser.add_argument("--matrix", type=Path, default=DEFAULT_MATRIX)
    parser.add_argument(
        "--bootstrap",
        action="store_true",
        help="write the initial registry from the current specification",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    expected = build_registry(args.spec)
    if args.bootstrap:
        if args.registry.exists():
            print(f"refusing to overwrite existing registry: {args.registry}", file=sys.stderr)
            return 2
        write_registry(args.registry, expected)
        print(
            f"Wrote {expected['requirementCount']} requirements to {args.registry}"
        )
        return 0

    try:
        registry = load_json(args.registry)
        mapping = load_json(args.mapping)
    except ValueError as error:
        print(error, file=sys.stderr)
        return 2

    errors = validate_registry(expected, registry)
    mapping_errors, reviewed_by_id = validate_mapping(registry, mapping, args.matrix)
    errors.extend(mapping_errors)
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    print_summary(registry, reviewed_by_id)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
