import os
import subprocess
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from check_no_data_files import MAX_BYTES, find_violations, main, tracked_files  # noqa: E402


def write(root: Path, rel: str, content: bytes = b"x") -> str:
    p = root / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(content)
    return rel


def test_rejects_nii_gz(tmp_path):
    rel = write(tmp_path, "data/x.nii.gz")
    found = find_violations([rel], tmp_path, set())
    assert len(found) == 1
    assert found[0].path == rel and found[0].rule == "data-suffix"


def test_rejects_uppercase_and_compound_extensions(tmp_path):
    rels = [write(tmp_path, n) for n in ("A.NII.GZ", "sub.dlabel.nii", "lh.func.gii")]
    found = find_violations(rels, tmp_path, set())
    assert [v.rule for v in found] == ["data-suffix"] * 3


def test_accepts_ordinary_source_files(tmp_path):
    rels = [
        write(tmp_path, "README.md", b"hello"),
        write(tmp_path, "frontend/src/App.tsx", b"export {}"),
        write(tmp_path, "docs/images/x.png", b"\x89PNG\x00\x01"),
    ]
    assert find_violations(rels, tmp_path, set()) == []


def test_rejects_large_file_without_extension(tmp_path):
    rel = write(tmp_path, "mesh", b"a" * (MAX_BYTES + 1))
    found = find_violations([rel], tmp_path, set())
    assert [v.rule for v in found] == ["size"]


def test_allowlist_exempts_size(tmp_path):
    rel = write(tmp_path, "mesh", b"a" * (MAX_BYTES + 1))
    assert find_violations([rel], tmp_path, {rel}) == []


def test_allowlist_cannot_exempt_data_extension(tmp_path):
    rel = write(tmp_path, "x.nii.gz")
    found = find_violations([rel], tmp_path, {rel})
    assert [v.rule for v in found] == ["data-suffix"]


def test_detects_ndar_id_and_abs_paths(tmp_path):
    text = "id " + "NDAR" + "AB123456" + " at " + "/mn" + "t/x\n"
    rel = write(tmp_path, "notes.txt", text.encode())
    found = find_violations([rel], tmp_path, set())
    assert [v.rule for v in found] == ["leak", "leak"]


@pytest.mark.parametrize("prefix", ["orcd", "scratch", "net", "mnt", "nfs", "gpfs", "lustre"])
def test_detects_generic_cluster_paths(tmp_path, prefix):
    rel = write(tmp_path, "c.txt", ("see /" + prefix + "/proj/x").encode())
    assert [v.rule for v in find_violations([rel], tmp_path, set())] == ["leak"]


def test_relative_and_url_paths_are_not_cluster_leaks(tmp_path):
    text = "docs/net/x and https://example.org/mnt/x and ./scratch/ and ~/net/y"
    rel = write(tmp_path, "ok.txt", text.encode())
    assert find_violations([rel], tmp_path, set()) == []


def test_detects_ndar_id_with_underscore(tmp_path):
    rel = write(tmp_path, "n.txt", ("NDAR" + "_INV" + "AB1CD").encode())
    assert [v.rule for v in find_violations([rel], tmp_path, set())] == ["leak"]


def test_detects_lowercase_ndar_id(tmp_path):
    rel = write(tmp_path, "n.txt", ("ndar" + "inv12345").encode())
    assert [v.rule for v in find_violations([rel], tmp_path, set())] == ["leak"]


def test_detects_ndar_id_in_path(tmp_path):
    rel = write(tmp_path, "data/sub-" + "NDAR" + "_INV12345" + ".txt", b"clean")
    found = find_violations([rel], tmp_path, set())
    assert [(v.rule, "in path" in v.detail) for v in found] == [("leak", True)]


def test_detects_home_path_in_path(tmp_path):
    rel = write(tmp_path, "sub/ho" + "me/alice/" + "x.txt", b"clean")
    found = find_violations([rel], tmp_path, set())
    assert [(v.rule, "in path" in v.detail) for v in found] == [("leak", True)]


def test_detects_home_and_users_paths(tmp_path):
    home = write(tmp_path, "h.txt", ("/hom" + "e/alice/data").encode())
    users = write(tmp_path, "u.txt", ("/User" + "s/Alice/data").encode())
    found = find_violations([home, users], tmp_path, set())
    assert [(v.path, v.rule) for v in found] == [(home, "leak"), (users, "leak")]


def test_file_of_exactly_max_bytes_is_accepted(tmp_path):
    rel = write(tmp_path, "mesh", b"a" * MAX_BYTES)
    assert find_violations([rel], tmp_path, set()) == []


def test_non_utf8_file_is_still_leak_scanned(tmp_path):
    rel = write(tmp_path, "blob", b"\xff\xfe\x00" + b"NDAR" + b"AB123456")
    assert [v.rule for v in find_violations([rel], tmp_path, set())] == ["leak"]


def test_binary_file_without_patterns_is_clean(tmp_path):
    rel = write(tmp_path, "blob", bytes(range(256)) * 4)
    assert find_violations([rel], tmp_path, set()) == []


def test_tracked_files_handles_spaces(tmp_path):
    subprocess.run(["git", "init", "-q"], cwd=tmp_path, check=True)
    (tmp_path / "a b.txt").write_text("x")
    subprocess.run(["git", "add", "a b.txt"], cwd=tmp_path, check=True)
    assert tracked_files(tmp_path) == ["a b.txt"]


def test_current_repo_is_clean(capsys):
    assert main([]) == 0
    assert capsys.readouterr().out == ""


def test_tracked_files_reports_non_utf8_name(tmp_path):
    subprocess.run(["git", "init", "-q"], cwd=tmp_path, check=True)
    raw = b"x\xff.nii"
    try:
        with open(os.path.join(os.fsencode(tmp_path), raw), "wb") as f:
            f.write(b"x")
    except OSError:
        pytest.skip("filesystem refuses non-UTF-8 names")
    subprocess.run(["git", "add", "--", os.fsdecode(raw)], cwd=tmp_path, check=True)
    names = tracked_files(tmp_path)
    assert len(names) == 1
    found = find_violations(names, tmp_path, set())
    assert [v.rule for v in found] == ["data-suffix"]


def test_rejects_symlink_to_missing_absolute_target(tmp_path):
    target = os.path.join(os.sep + "nonexistent-" + "target", "atlas.txt")
    (tmp_path / "link.txt").symlink_to(target)
    found = find_violations(["link.txt"], tmp_path, set())
    assert [(v.rule, v.detail) for v in found] == [("symlink", "tracked symbolic link")]


def test_allowlist_cannot_exempt_symlink(tmp_path):
    (tmp_path / "real.txt").write_text("x")
    (tmp_path / "link.txt").symlink_to("real.txt")
    found = find_violations(["link.txt"], tmp_path, {"link.txt"})
    assert [v.rule for v in found] == ["symlink"]


@pytest.mark.parametrize(
    "name", ["c.tsv.gz", "mesh.bin", "lh.pial", "a.zip", "b.tgz", "x.drc", "v.mnc", "t.trk"]
)
def test_rejects_added_data_suffixes(tmp_path, name):
    rel = write(tmp_path, name)
    assert [v.rule for v in find_violations([rel], tmp_path, set())] == ["data-suffix"]


def test_rejects_gzip_content_under_innocent_name(tmp_path):
    rel = write(tmp_path, "atlas.nii.gz.txt", b"\x1f\x8b\x08\x00rest")
    found = find_violations([rel], tmp_path, set())
    assert [(v.rule, v.detail) for v in found] == [("data-suffix", "compressed content")]


def test_rejects_zip_content_under_innocent_name(tmp_path):
    rel = write(tmp_path, "notes.txt", b"PK\x03\x04rest")
    found = find_violations([rel], tmp_path, set())
    assert [(v.rule, v.detail) for v in found] == [("data-suffix", "compressed content")]


def test_allowlist_cannot_exempt_compressed_content(tmp_path):
    rel = write(tmp_path, "notes.txt", b"\x1f\x8b\x08\x00")
    assert [v.rule for v in find_violations([rel], tmp_path, {rel})] == ["data-suffix"]


def test_word_containing_ndar_is_not_an_id(tmp_path):
    rel = write(tmp_path, "w.tsx", b"<meshStandardMaterial />")
    assert find_violations([rel], tmp_path, set()) == []


# Tokens are split so this file does not match the patterns it tests.
NDAR_ID = "NDAR" + "INVAB123456"


def rules(root, *rels, allow=frozenset()):
    return [v.rule for v in find_violations(list(rels), root, set(allow))]


@pytest.mark.parametrize("codec", ["utf-16", "utf-16-le", "utf-16-be", "utf-32"])
def test_utf16_and_utf32_text_is_leak_scanned(tmp_path, codec):
    rel = write(tmp_path, "ids.txt", ("subject " + NDAR_ID + "\n").encode(codec))
    assert rules(tmp_path, rel) == ["leak"]


@pytest.mark.parametrize(
    "text",
    [
        "NDAR" + "-INVAB123456",
        "NDAR" + " INVAB123456",
        "cd /ho" + "me/alice",
        "/ho" + "me/first.last/data",
        "see /Us" + "ers/alice",
        "root=/or" + "cd",
        "mount /sc" + "ratch",
    ],
)
def test_detects_leak_spellings(tmp_path, text):
    rel = write(tmp_path, "c.txt", (text + "\n").encode())
    assert rules(tmp_path, rel) == ["leak"]


@pytest.mark.parametrize("text", ["the /" + "network folder", "/" + "orcdx/y", "/ho" + "me/ is empty"])
def test_longer_names_are_not_leaks(tmp_path, text):
    rel = write(tmp_path, "ok.txt", text.encode())
    assert rules(tmp_path, rel) == []


def test_lfs_pointer_rejected_even_if_allowlisted(tmp_path):
    pointer = b"version https://git-lfs.github.com/spec/v1\noid sha256:" + b"0" * 64 + b"\nsize 3000938\n"
    rel = write(tmp_path, "atlas.dat", pointer)
    assert rules(tmp_path, rel, allow={rel}) == ["git-filter"]


@pytest.mark.parametrize(
    "line",
    ["*.dat filter=lfs diff=lfs merge=lfs -text", "ids.txt working-tree-encoding=UTF-16LE"],
)
def test_gitattributes_filter_or_encoding_rejected(tmp_path, line):
    rel = write(tmp_path, "sub/.gitattributes", (line + "\n").encode())
    assert rules(tmp_path, rel, allow={rel}) == ["git-filter"]


def test_gitattributes_without_filter_is_clean(tmp_path):
    text = "# filter=lfs is not used here\n*.sh text eol=lf\n*.png binary\n"
    rel = write(tmp_path, ".gitattributes", text.encode())
    assert rules(tmp_path, rel) == []


def test_missing_tracked_file_is_reported(tmp_path):
    assert rules(tmp_path, "gone.txt") == ["unreadable"]


@pytest.mark.skipif(os.geteuid() == 0, reason="root can read any file")
def test_unreadable_file_is_reported(tmp_path):
    rel = write(tmp_path, "ids.txt", NDAR_ID.encode())
    (tmp_path / rel).chmod(0)
    try:
        assert rules(tmp_path, rel) == ["unreadable"]
    finally:
        (tmp_path / rel).chmod(0o644)


def test_guard_files_are_scanned_like_any_other(tmp_path):
    rel = write(tmp_path, "scripts/tests/test_check_no_data_files.py", ("ID = '" + NDAR_ID + "'\n").encode())
    assert rules(tmp_path, rel) == ["leak"]
