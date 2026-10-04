from typing import List, Optional
from pydantic import BaseModel


class JobPostingSignalOut(BaseModel):
    id: int
    district_code: str
    nco_code: str
    period: str
    active_postings: int
    hiring_velocity_score: float
    median_wage_inr: float
    source: str

    class Config:
        from_attributes = True


class IndustrialCapexSignalOut(BaseModel):
    id: int
    project_name: str
    district_code: str
    sector_code: str
    primary_nco_code: str
    investment_inr_cr: float
    announcement_period: str
    gestation_period_months: int
    expected_direct_jobs: int
    status: str
    scheme_ref: Optional[str] = None

    class Config:
        from_attributes = True


class CDIBreakdown(BaseModel):
    district_code: str
    district_name: str
    nco_code: str
    trade_title: str
    period: str
    posting_component: float
    capex_component: float
    velocity_component: float
    wage_component: float
    migration_component: float
    cdi_score: float
    projected_headcount_demand: int


class DemandSummaryOut(BaseModel):
    total_active_postings: int
    total_capex_cr: float
    total_projected_direct_jobs: int
    average_cdi: float
    top_demanded_trades: List[CDIBreakdown]
