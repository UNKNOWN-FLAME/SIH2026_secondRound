from typing import List, Optional
from pydantic import BaseModel, Field


class SectorBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    annual_growth_rate_pct: float
    ssc_name: Optional[str] = None


class SectorOut(SectorBase):
    class Config:
        from_attributes = True


class NCOOccupationBase(BaseModel):
    nco_code: str
    division: str
    sub_division: str
    group_code: str
    title: str
    sector_code: str
    nsqf_level: int
    description: str
    typical_roles: Optional[str] = None
    core_skills: str
    is_emerging: bool
    is_legacy_at_risk: bool


class NCOOccupationOut(NCOOccupationBase):
    class Config:
        from_attributes = True


class NCOMatchRequest(BaseModel):
    query_text: str = Field(..., description="Raw job title, job description, or course title to classify")
    top_k: int = Field(default=3, description="Number of best matching NCO occupations to return")


class NCOMatchItem(BaseModel):
    nco_code: str
    title: str
    sector_code: str
    nsqf_level: int
    similarity_score: float
    matched_skills: List[str]
    is_emerging: bool
    is_legacy_at_risk: bool


class NCOMatchResponse(BaseModel):
    query_text: str
    matches: List[NCOMatchItem]
