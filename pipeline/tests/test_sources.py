from datetime import date, timedelta
from pathlib import Path

import pytest

from mentisphere_pipeline.cli import main
from mentisphere_pipeline.sources import (
    NotBuildable,
    SourceError,
    assert_buildable,
    load_sources,
)

SHA = "a" * 64

REPO_KEYS = [
    "fslr-hcp-s1200",
    "hcpmmp1",
    "fsaverage",
    "dk",
    "dkt",
    "aseg-fsaverage",
    "brodmann-fs-ba",
    "brodmann-mricron-nii",
    "ho-cort",
    "ho-sub",
    "julich3",
    "schaefer2018",
    "tians4",
    "tpl-mni152nlin6asym",
    "tpl-mni152nlin2009casym",
    "neurosynth",
    "neuroquery",
]


def source_yaml(
    key="dkt",
    audited="2026-11-16",
    local_use="true",
    license_url="https://example.org/license",
    acquisition=None,
    extra_name="",
):
    if acquisition is None:
        acquisition = f"""
    mode: fetch
    url: https://example.org/file.nii.gz
    sha256: {SHA}"""
    acquisition = "\n".join(
        "  " + line if line else line for line in acquisition.split("\n")
    )
    return f"""
  - key: "{key}"
    kind: atlas
    name: Test atlas
{extra_name}    version: "1"
    space: fsaverage
    license:
      name: Test license
      url: {license_url}
      local_use: {local_use}
      copy_between_own_machines: true
      redistribute: true
      attribution: Credit the authors
      audited: {audited}
    citation:
      text: Author A (2020) Title. Journal 1:1-2
      doi: null
    acquisition:{acquisition}
"""


def write(tmp_path, *entries):
    path = tmp_path / "sources.yaml"
    path.write_text("sources:\n" + "".join(entries), encoding="utf-8")
    return path


def test_valid_fetch_source_loads(tmp_path):
    sources = load_sources(write(tmp_path, source_yaml()))
    assert len(sources) == 1
    assert sources[0].acquisition.mode == "fetch"


def test_duplicate_yaml_mapping_key_rejected(tmp_path):
    path = write(tmp_path, source_yaml(extra_name="    name: Again\n"))
    with pytest.raises(SourceError) as info:
        load_sources(path)
    message = str(info.value)
    assert "sources.yaml" in message
    assert "dkt" in message
    assert str(tmp_path) not in message


def test_unhashable_mapping_key_rejected(tmp_path):
    path = tmp_path / "sources.yaml"
    path.write_text("sources:\n  - ? [a, b]\n    : 1\n", encoding="utf-8")
    with pytest.raises(SourceError):
        load_sources(path)


def test_non_utf8_manifest_rejected(tmp_path, capsys):
    path = tmp_path / "sources.yaml"
    path.write_bytes(b"sources:\n  - name: \xff\xfe\n")
    with pytest.raises(SourceError):
        load_sources(path)
    assert main(["check-sources", str(path)]) == 1


def test_duplicate_source_key_rejected(tmp_path):
    path = write(tmp_path, source_yaml(), source_yaml())
    with pytest.raises(SourceError, match="dkt"):
        load_sources(path)


def test_bad_key_pattern_rejected(tmp_path):
    with pytest.raises(SourceError):
        load_sources(write(tmp_path, source_yaml(key="DKT_40")))


def test_http_license_url_rejected(tmp_path):
    path = write(tmp_path, source_yaml(license_url="http://example.org/license"))
    with pytest.raises(SourceError):
        load_sources(path)


def test_http_acquisition_url_rejected(tmp_path):
    acq = f"""
    mode: fetch
    url: http://example.org/file.nii.gz
    sha256: {SHA}"""
    with pytest.raises(SourceError):
        load_sources(write(tmp_path, source_yaml(acquisition=acq)))


@pytest.mark.parametrize("value", ['"yes"', "1", '"true"', "0"])
def test_non_boolean_local_use_rejected(tmp_path, value):
    with pytest.raises(SourceError):
        load_sources(write(tmp_path, source_yaml(local_use=value)))


@pytest.mark.parametrize(
    "audited",
    [
        "1999-12-31",
        "1970-01-01",
        (date.today() + timedelta(days=1)).isoformat(),
    ],
)
def test_implausible_audit_date_rejected(tmp_path, audited):
    with pytest.raises(SourceError, match="audited"):
        load_sources(write(tmp_path, source_yaml(audited=audited)))


@pytest.mark.parametrize("audited", ["2000-01-01", date.today().isoformat()])
def test_boundary_audit_dates_accepted(tmp_path, audited):
    (src,) = load_sources(write(tmp_path, source_yaml(audited=audited)))
    assert src.license.audited == date.fromisoformat(audited)


def test_unaudited_not_buildable(tmp_path):
    (src,) = load_sources(write(tmp_path, source_yaml(audited="null")))
    with pytest.raises(NotBuildable, match="not audited"):
        assert_buildable(src)


def test_local_use_false_not_buildable(tmp_path):
    (src,) = load_sources(write(tmp_path, source_yaml(local_use="false")))
    with pytest.raises(NotBuildable, match="local use"):
        assert_buildable(src)


def test_local_use_unclear_not_buildable(tmp_path):
    (src,) = load_sources(write(tmp_path, source_yaml(local_use="null")))
    assert src.license.local_use is None
    with pytest.raises(NotBuildable, match="local use"):
        assert_buildable(src)


def test_manual_without_sha256_not_buildable(tmp_path):
    acq = """
    mode: manual
    instructions_url: https://example.org/how
    filename: file.nii.gz
    sha256: null"""
    (src,) = load_sources(write(tmp_path, source_yaml(acquisition=acq)))
    with pytest.raises(NotBuildable, match="sha256"):
        assert_buildable(src)


def test_malformed_sha256_rejected(tmp_path):
    acq = """
    mode: fetch
    url: https://example.org/file.nii.gz
    sha256: "abc\""""
    with pytest.raises(SourceError):
        load_sources(write(tmp_path, source_yaml(acquisition=acq)))


def test_uppercase_sha256_rejected(tmp_path):
    acq = f"""
    mode: fetch
    url: https://example.org/file.nii.gz
    sha256: "{'A' * 64}\""""
    with pytest.raises(SourceError):
        load_sources(write(tmp_path, source_yaml(acquisition=acq)))


def test_audited_manual_source_with_sha256_buildable(tmp_path):
    acq = f"""
    mode: manual
    instructions_url: https://example.org/how
    filename: file.nii.gz
    sha256: {SHA}"""
    (src,) = load_sources(write(tmp_path, source_yaml(acquisition=acq)))
    assert_buildable(src)


def test_fully_audited_source_buildable(tmp_path):
    (src,) = load_sources(write(tmp_path, source_yaml()))
    assert_buildable(src)


def test_repo_manifest_loads():
    sources = load_sources(Path(__file__).parents[1] / "sources.yaml")
    assert [s.key for s in sources] == REPO_KEYS


def test_repo_manifest_nothing_buildable_yet():
    sources = load_sources(Path(__file__).parents[1] / "sources.yaml")
    assert all(s.acquisition.sha256 is None for s in sources)


def test_cli_exit_codes(tmp_path, capsys):
    bad = write(tmp_path, source_yaml(key="DKT_40"))
    assert main(["check-sources", str(bad)]) == 1
    repo = Path(__file__).parents[1] / "sources.yaml"
    assert main(["check-sources", str(repo)]) == 0
    out = capsys.readouterr().out
    assert "dkt: not buildable: " in out


def test_cli_reports_buildable(tmp_path, capsys):
    good = write(tmp_path, source_yaml())
    assert main(["check-sources", str(good)]) == 0
    assert capsys.readouterr().out.strip() == "dkt: buildable"
