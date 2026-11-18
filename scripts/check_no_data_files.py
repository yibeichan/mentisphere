#!/usr/bin/env python3
"""Reject data files, oversized files and private strings in tracked files.

Stdlib only. Lists tracked files with `git ls-files`, then flags:
  symlink      a tracked symbolic link
  data-suffix  a data or mesh file extension, or gzip/zip content under any name
  git-filter   a Git LFS pointer, or a .gitattributes line that sets `filter=`
               or `working-tree-encoding=` (the checked-out file would then
               differ from what git stores, so the other checks could not see it)
  unreadable   a tracked file that is missing or cannot be read
  size         a file larger than MAX_BYTES
  leak         a path or file content matching LEAK_PATTERNS; content is
               decoded leniently, and text with NUL bytes (UTF-16, UTF-32) is
               scanned again with the NULs removed

Paths listed in scripts/data_guard_allow.txt skip the size and leak checks only.
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
    ".gz", ".zip", ".tar", ".tgz", ".bz2", ".xz", ".7z", ".bin", ".drc", ".mnc",
    ".nrrd", ".img", ".hdr", ".tck", ".trk", ".curv", ".sulc", ".thickness",
    ".pial", ".white", ".inflated", ".sphere", ".ctab",
)
COMPRESSED_MAGIC: tuple[bytes, ...] = (b"\x1f\x8b", b"PK\x03\x04")
LFS_POINTER = b"version https://git-lfs.github.com/spec/"
ATTRIBUTE_RE = re.compile(r"(?<![\w-])(?:filter|working-tree-encoding)=")
MAX_BYTES = 1_000_000
# A mount name must end there: a folder called "network" is not the "net" mount.
_END = r"(?![\w.-])"
LEAK_PATTERNS: tuple[re.Pattern[str], ...] = tuple(
    re.compile(p, flags)
    for p, flags in (
        (r"(?<![A-Za-z])NDAR[\s_-]?[A-Z0-9]{8}", re.IGNORECASE),
        (r"(?<![\w.~-])/(?:orcd|scratch|net|mnt|nfs|gpfs|lustre)" + _END, 0),
        (r"/home/[A-Za-z_][\w.-]*", 0),
        (r"/Users/[A-Za-z][^/\s]*", 0),
    )
)
ALLOW_FILE = Path("scripts/data_guard_allow.txt")

Rule = Literal["symlink", "data-suffix", "git-filter", "unreadable", "size", "leak"]


@dataclass(frozen=True)
class Violation:
    path: str
    rule: Rule
    detail: str


def _texts(data: bytes) -> list[str]:
    texts = [data.decode("utf-8", errors="replace")]
    if b"\0" in data:
        texts.append(data.replace(b"\0", b"").decode("utf-8", errors="replace"))
    return texts


def find_violations(paths: Iterable[str], root: Path, allow: set[str]) -> list[Violation]:
    found: list[Violation] = []
    for rel in paths:
        file = root / rel
        if file.is_symlink():
            found.append(Violation(rel, "symlink", "tracked symbolic link"))
            continue
        lower = rel.lower()
        for suffix in DATA_SUFFIXES:
            if lower.endswith(suffix):
                found.append(Violation(rel, "data-suffix", f"data file extension {suffix}"))
                break
        if file.is_dir():
            # A submodule; its files live in another repository.
            continue
        try:
            size = file.stat().st_size
            with open(file, "rb") as f:
                data = f.read(MAX_BYTES + 1)
        except OSError as exc:
            found.append(Violation(rel, "unreadable", f"cannot read ({type(exc).__name__})"))
            continue
        if not any(v.path == rel and v.rule == "data-suffix" for v in found) and data.startswith(
            COMPRESSED_MAGIC
        ):
            found.append(Violation(rel, "data-suffix", "compressed content"))
        if data.startswith(LFS_POINTER):
            found.append(Violation(rel, "git-filter", "Git LFS pointer"))
        if Path(rel).name == ".gitattributes":
            for line in data.decode("utf-8", errors="replace").splitlines():
                if not line.lstrip().startswith("#") and ATTRIBUTE_RE.search(line):
                    found.append(
                        Violation(rel, "git-filter", "sets filter= or working-tree-encoding=")
                    )
                    break
        if rel in allow:
            continue
        for pattern in LEAK_PATTERNS:
            if pattern.search(rel):
                found.append(Violation(rel, "leak", f"matches {pattern.pattern} in path"))
        if size > MAX_BYTES:
            found.append(Violation(rel, "size", f"{size} bytes exceeds {MAX_BYTES}"))
            continue
        texts = _texts(data)
        for pattern in LEAK_PATTERNS:
            if any(pattern.search(text) for text in texts):
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
