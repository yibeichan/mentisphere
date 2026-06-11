from pydantic import BaseModel


class RegionCitation(BaseModel):
    id: str
    label: str
    sourceType: str


class Region(BaseModel):
    id: str
    name: str
    category: str
    hemisphere: str
    summary: str
    functions: list[str]
    nearbyRegionIds: list[str]
    searchTerms: list[str]
    citations: list[RegionCitation]
    color: str
    position: tuple[float, float, float]
    scale: tuple[float, float, float]
