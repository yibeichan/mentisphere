from pydantic import BaseModel


class Region(BaseModel):
    id: str
    name: str
    category: str
    hemisphere: str
    summary: str
    functions: list[str]
    nearbyRegionIds: list[str]
    searchTerms: list[str]
    citations: list[str]
