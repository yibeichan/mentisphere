"""Source manifest model and license gate.

A source can be built only when its license was audited, local use is allowed
and the checksum of its file is recorded.
"""

from __future__ import annotations

import re
from datetime import date
from enum import Enum
from pathlib import Path
from typing import Annotated, Literal

import yaml
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
    UrlConstraints,
    ValidationError,
    field_validator,
)

HttpsUrl = Annotated[HttpUrl, UrlConstraints(allowed_schemes=["https"])]

_SHA256_RE = re.compile(r"^[0-9a-f]{64}$")


class SourceError(ValueError):
    """The manifest is malformed."""


class NotBuildable(SourceError):
    """A source fails the license or checksum gate."""


class Space(str, Enum):
    fsLR_32k = "fsLR-32k"
    fsaverage = "fsaverage"
    MNI152NLin6Asym = "MNI152NLin6Asym"
    MNI152NLin2009cAsym = "MNI152NLin2009cAsym"


class _Model(BaseModel):
    model_config = ConfigDict(extra="forbid")


class License(_Model):
    name: str
    url: HttpsUrl
    local_use: bool | None
    copy_between_own_machines: bool | None
    redistribute: bool | None
    attribution: str
    audited: date | None


def _check_sha256(value: str | None) -> str | None:
    if value is not None and not _SHA256_RE.match(value):
        raise ValueError("sha256 must be 64 lowercase hex characters")
    return value


class FetchAcquisition(_Model):
    mode: Literal["fetch"]
    url: HttpsUrl
    sha256: str | None

    _sha = field_validator("sha256")(_check_sha256)


class ManualAcquisition(_Model):
    mode: Literal["manual"]
    instructions_url: HttpsUrl
    filename: str
    sha256: str | None

    _sha = field_validator("sha256")(_check_sha256)


class Citation(_Model):
    text: str
    doi: str | None


class Source(_Model):
    key: str = Field(pattern=r"^[a-z0-9][a-z0-9-]*$")
    kind: Literal["surface", "atlas", "template", "decoding"]
    name: str
    version: str
    space: Space | None
    license: License
    citation: Citation
    acquisition: Annotated[
        FetchAcquisition | ManualAcquisition, Field(discriminator="mode")
    ]


class _UniqueKeyLoader(yaml.SafeLoader):
    """SafeLoader that rejects a repeated key in a mapping."""


def _construct_unique_mapping(loader: _UniqueKeyLoader, node: yaml.MappingNode):
    loader.flatten_mapping(node)
    seen: set = set()
    for key_node, _ in node.value:
        key = loader.construct_object(key_node, deep=True)
        if key in seen:
            raise SourceError(
                f"duplicate mapping key {key!r} (line {key_node.start_mark.line + 1})"
            )
        seen.add(key)
    return loader.construct_mapping(node, deep=True)


_UniqueKeyLoader.add_constructor(
    yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, _construct_unique_mapping
)


def load_sources(path: Path) -> list[Source]:
    """Parse and validate a manifest; raise SourceError on any problem."""
    try:
        data = yaml.load(Path(path).read_text(encoding="utf-8"), Loader=_UniqueKeyLoader)
    except yaml.YAMLError as exc:
        raise SourceError(f"{path}: invalid YAML: {exc}") from exc
    if not isinstance(data, dict) or not isinstance(data.get("sources"), list):
        raise SourceError(f"{path}: top level must be a mapping with a 'sources' list")

    sources: list[Source] = []
    seen: set[str] = set()
    for index, raw in enumerate(data["sources"]):
        label = raw.get("key", f"#{index}") if isinstance(raw, dict) else f"#{index}"
        try:
            source = Source.model_validate(raw)
        except ValidationError as exc:
            raise SourceError(f"source {label}: {exc}") from exc
        if source.key in seen:
            raise SourceError(f"duplicate source key: {source.key}")
        seen.add(source.key)
        sources.append(source)
    return sources


def assert_buildable(source: Source) -> None:
    """Raise NotBuildable unless the license gate and checksum are satisfied."""
    if source.license.audited is None:
        raise NotBuildable("license not audited")
    if source.license.local_use is not True:
        raise NotBuildable("local use not allowed or unclear")
    sha = source.acquisition.sha256
    if sha is None or not _SHA256_RE.match(sha):
        raise NotBuildable("no sha256 checksum")
