import json
from functools import lru_cache
from pathlib import Path

from api.models.region import Region

REGION_DATA_PATH = Path(__file__).resolve().parents[3] / "data" / "metadata" / "regions.json"


@lru_cache
def list_regions() -> list[Region]:
    with REGION_DATA_PATH.open("r", encoding="utf-8") as region_file:
        raw_regions = json.load(region_file)

    return [Region.model_validate(region) for region in raw_regions]


def get_region(region_id: str) -> Region | None:
    return next((region for region in list_regions() if region.id == region_id), None)


def search_regions(query: str) -> list[Region]:
    normalized_query = query.strip().lower()

    if len(normalized_query) < 2:
        return []

    matches: list[Region] = []
    for region in list_regions():
        searchable_text = " ".join(
            [
                region.name,
                region.category,
                region.hemisphere,
                region.summary,
                *region.functions,
                *region.searchTerms,
            ]
        ).lower()

        if normalized_query in searchable_text:
            matches.append(region)

    return matches
