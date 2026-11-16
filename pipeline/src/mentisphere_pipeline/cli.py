"""Command line entry point."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from .sources import NotBuildable, SourceError, assert_buildable, load_sources

DEFAULT_MANIFEST = Path("pipeline/sources.yaml")


def _check_sources(path: Path) -> int:
    try:
        sources = load_sources(path)
    except (SourceError, OSError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    for source in sources:
        try:
            assert_buildable(source)
        except NotBuildable as exc:
            print(f"{source.key}: not buildable: {exc}")
        else:
            print(f"{source.key}: buildable")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="menti-pipeline")
    sub = parser.add_subparsers(dest="command", required=True)
    check = sub.add_parser("check-sources", help="validate the source manifest")
    check.add_argument("path", nargs="?", type=Path, default=DEFAULT_MANIFEST)
    args = parser.parse_args(argv)
    if args.command == "check-sources":
        return _check_sources(args.path)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
