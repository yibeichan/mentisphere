from api.services.regions import list_regions


def test_region_metadata_is_complete() -> None:
    regions = list_regions()
    region_ids = {region.id for region in regions}

    assert len(region_ids) == len(regions)

    for region in regions:
        assert region.name
        assert region.summary
        assert region.functions
        assert region.searchTerms
        assert region.citations
        assert region.color.startswith("#")
        assert len(region.position) == 3
        assert len(region.scale) == 3

        for citation in region.citations:
            assert citation.id
            assert citation.label
            assert citation.sourceType

        for nearby_region_id in region.nearbyRegionIds:
            assert nearby_region_id in region_ids
