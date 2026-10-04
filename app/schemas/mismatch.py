from typing import List
from pydantic import BaseModel


class MismatchRankingItem(BaseModel):
    rank: int
    district_code: str
    district_name: str
    state_code: str
    nco_code: str
    trade_title: str
    sector_code: str
    projected_demand: int
    projected_supply: int
    gap_headcount: int  # demand - supply
    mismatch_ratio: float  # demand / supply
    severity_flag: str  # ACUTE_SHORTAGE, MODERATE_SHORTAGE, BALANCED, MILD_SURPLUS, CHRONIC_SATURATION
    action_type: str    # "URGENT_SANCTION", "EXPAND_CAPACITY", "EQUILIBRIUM", "FREEZE_TARGETS", "MANDATORY_RESKILLING"
    alert_summary: str


class EarlyWarningAlert(BaseModel):
    alert_id: str
    alert_level: str  # "RED", "ORANGE", "YELLOW"
    district_name: str
    state_code: str
    trade_title: str
    nco_code: str
    issue: str
    projected_impact: str
    recommended_intervention: str


class DistrictHeatmapPoint(BaseModel):
    district_code: str
    district_name: str
    state_code: str
    latitude: float
    longitude: float
    industrial_focus: str
    overall_stress_index: float  # 0 to 100
    dominant_shortage_trade: str
    dominant_surplus_trade: str
    acute_shortages_count: int
    chronic_surpluses_count: int


class MismatchDashboardResponse(BaseModel):
    total_shortage_headcount: int
    total_surplus_headcount: int
    overall_system_balance_pct: float
    top_undersupplied_trades: List[MismatchRankingItem]
    top_oversupplied_trades: List[MismatchRankingItem]
    active_early_warnings: List[EarlyWarningAlert]
    district_heatmaps: List[DistrictHeatmapPoint]
