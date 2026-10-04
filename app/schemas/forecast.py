from typing import List, Optional
from pydantic import BaseModel


class ForecastPoint(BaseModel):
    period: str
    projected_demand_p50: float
    projected_demand_p10: float
    projected_demand_p90: float
    projected_supply: float
    mismatch_ratio: float
    severity_flag: str


class TradeForecastSeries(BaseModel):
    district_code: str
    district_name: str
    nco_code: str
    trade_title: str
    sector_code: str
    horizon_months: int
    historical_points: List[ForecastPoint]
    future_points: List[ForecastPoint]
    overall_severity: str
    executive_recommendation: str


class ForecastFilterRequest(BaseModel):
    district_code: Optional[str] = None
    sector_code: Optional[str] = None
    nco_code: Optional[str] = None
    horizon_months: int = 12
    granularity: str = "monthly"  # "monthly" or "quarterly"
