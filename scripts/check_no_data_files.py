#!/usr/bin/env python3
"""Reject data files, oversized files and private strings in tracked files.

Stdlib only. Lists tracked files with `git ls-files`, then flags:
  data-suffix  a data or mesh file extension (never exempted by the allowlist)
  size         a file larger than MAX_BYTES
  leak         a UTF-8 text file matching LEAK_PATTERNS

Paths listed in scripts/data_guard_allow.txt skip the size and leak checks.
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Literal

DATA_SUFFIXES: tuple[str, ...] = (
    ".nii", ".nii.gz", ".gii", ".mgz", ".mgh", ".annot", ".label", ".glb",
    ".gltf", ".obj", ".ply", ".stl", ".vtk", ".npy", ".npz", ".h5", ".hdf5",
    ".pkl", ".mat", ".tsv", ".csv", ".parquet",
)
MAX_BYTES = 1_000_000
LEAK_PATTERNS: tuple[re.Pattern[str], ...] = tuple(
    re.compile(p)
    for p in (
        r"NDAR[A-Z0-9]{8}",
        r"/orcd/",
        r"/home/[a-z][a-z0-9_-]*/",
        r"/Users/[A-Za-z][^/]*/",
    )
)
# These files contain the patterns themselves.
SELF_EXCLUDED = frozenset(
    {"scripts/check_no_data_files.py", "scripts/tests/test_check_no_data_files.py"}
)
ALLOW_FILE = Path("scripts/data_guard_allow.txt")


@dataclass(frozen=True)
class Violation:
    path: str
    rule: Literal["data-suffix", "size", "leak"]
    detail: str


def find_violations(paths: Iterable[str], root: Path, allow: set[str]) -> list[Violation]:
    found: list[Violation] = []
    for rel in paths:
        lower = rel.lower()
        for suffix in DATA_SUFFIXES:
            if lower.endswith(suffix):
                found.append(Violation(rel, "data-suffix", f"data file extension {suffix}"))
                break
        if rel in allow:
            continue
        file = root / rel
        try:
            size = file.stat().st_size
        except OSError:
            continue
        if size > MAX_BYTES:
            found.append(Violation(rel, "size", f"{size} bytes exceeds {MAX_BYTES}"))
            continue
        if rel in SELF_EXCLUDED or not file.is_file():
            continue
        try:
            text = file.read_bytes().decode("utf-8")
        except (OSError, UnicodeDecodeError):
            continue
        for pattern in LEAK_PATTERNS:
            if pattern.search(text):
                found.append(Violation(rel, "leak", f"matches {pattern.pattern}"))
    return found


def tracked_files(root: Path) -> list[str]:
    out = subprocess.run(
        ["git", "-C", str(root), "ls-files", "-z"],
        check=True, capture_output=True,
    ).stdout
    return [p.decode("utf-8", errors="surrogateescape") for p in out.split(b"\0") if p]


def load_allow(root: Path) -> set[str]:
    try:
        lines = (root / ALLOW_FILE).read_text(encoding="utf-8").splitlines()
    except FileNotFoundError:
        return set()
    return {s for s in (line.strip() for line in lines) if s and not s.startswith("#")}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args(argv)
    root = args.root
    violations = find_violations(tracked_files(root), root, load_allow(root))
    for v in violations:
        print(f"{v.path}: {v.rule}: {v.detail}")
    return 1 if violations else 0


if __name__ == "__main__":
    sys.exit(main())
