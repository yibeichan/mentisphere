from fastapi import APIRouter, HTTPException, Query

from api.models.region import Region
from api.services.regions import get_region, list_regions, search_regions

router = APIRouter(prefix="/api", tags=["regions"])


@router.get("/regions", response_model=list[Region])
async def regions() -> list[Region]:
    return list_regions()


@router.get("/regions/{region_id}", response_model=Region)
async def region(region_id: str) -> Region:
    selected_region = get_region(region_id)

    if selected_region is None:
        raise HTTPException(status_code=404, detail="Region not found")

    return selected_region


@router.get("/search", response_model=list[Region])
async def search(q: str = Query(default="", min_length=0)) -> list[Region]:
    return search_regions(q)
