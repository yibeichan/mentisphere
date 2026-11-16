#!/usr/bin/env python3
"""Reject data files, oversized files and private strings in tracked files.

Stdlib only. Lists tracked files with `git ls-files`, then flags:
  symlink      a tracked symbolic link (never exempted by the allowlist)
  data-suffix  a data or mesh file extension, or gzip/zip content under any
               name (never exempted by the allowlist)
  size         a file larger than MAX_BYTES
  leak         a path or file content (decoded leniently) matching LEAK_PATTERNS

Paths listed in scripts/data_guard_allow.txt skip the size and leak checks.
"""
from __future__ import annotations

import argparse
import os
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
    ".gz", ".zip", ".tar", ".tgz", ".bz2", ".xz", ".7z", ".bin", ".drc", ".mnc",
    ".nrrd", ".img", ".hdr", ".tck", ".trk", ".curv", ".sulc", ".thickness",
    ".pial", ".white", ".inflated", ".sphere", ".ctab",
)
COMPRESSED_MAGIC: tuple[bytes, ...] = (b"\x1f\x8b", b"PK\x03\x04")
MAX_BYTES = 1_000_000
LEAK_PATTERNS: tuple[re.Pattern[str], ...] = tuple(
    re.compile(p, flags)
    for p, flags in (
        (r"(?<![A-Za-z])NDAR_?[A-Z0-9]{8}", re.IGNORECASE),
        (r"(?<![\w.~-])/(?:orcd|scratch|net|mnt|nfs|gpfs|lustre)/", 0),
        (r"/home/[a-z][a-z0-9_-]*/", 0),
        (r"/Users/[A-Za-z][^/]*/", 0),
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
    rule: Literal["symlink", "data-suffix", "size", "leak"]
    detail: str


def _has_compressed_magic(file: Path) -> bool:
    try:
        with open(file, "rb") as f:
            head = f.read(4)
    except OSError:
        return False
    return head.startswith(COMPRESSED_MAGIC)


def find_violations(paths: Iterable[str], root: Path, allow: set[str]) -> list[Violation]:
    found: list[Violation] = []
    for rel in paths:
        file = root / rel
        if file.is_symlink():
            found.append(Violation(rel, "symlink", "tracked symbolic link"))
            continue
        lower = rel.lower()
        suffix_hit = False
        for suffix in DATA_SUFFIXES:
            if lower.endswith(suffix):
                found.append(Violation(rel, "data-suffix", f"data file extension {suffix}"))
                suffix_hit = True
                break
        if not suffix_hit and _has_compressed_magic(file):
            found.append(Violation(rel, "data-suffix", "compressed content"))
        if rel in allow:
            continue
        for pattern in LEAK_PATTERNS:
            if pattern.search(rel):
                found.append(Violation(rel, "leak", f"matches {pattern.pattern} in path"))
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
            text = file.read_bytes().decode("utf-8", errors="replace")
        except OSError:
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
