from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_list_regions() -> None:
    response = client.get("/api/regions")

    assert response.status_code == 200
    regions = response.json()
    assert len(regions) == 12
    assert {region["id"] for region in regions} >= {"hippocampus", "amygdala", "frontal-lobe"}


def test_get_region() -> None:
    response = client.get("/api/regions/hippocampus")

    assert response.status_code == 200
    assert response.json()["name"] == "Hippocampus"


def test_search_regions_by_function() -> None:
    response = client.get("/api/search?q=memory")

    assert response.status_code == 200
    result_ids = {region["id"] for region in response.json()}
    assert {"hippocampus", "amygdala"} <= result_ids


def test_get_missing_region() -> None:
    response = client.get("/api/regions/not-a-region")

    assert response.status_code == 404
