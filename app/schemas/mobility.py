from typing import List, Optional
from pydantic import BaseModel, Field


class CorridorRouteItem(BaseModel):
    corridor_id: str
    origin_district_code: str
    origin_district_name: str
    origin_state: str
    destination_district_code: str
    destination_district_name: str
    destination_state: str
    nco_code: str
    trade_title: str
    distance_km: float
    origin_surplus_candidates: int
    destination_unfilled_jobs: int
    origin_median_wage_inr: float
    destination_median_wage_inr: float
    wage_premium_pct: float
    gravity_mobility_score: float  # Computed via Spatial Econometric Gravity Formula
    estimated_absorbable_candidates: int
    recommended_voucher_stipend_inr: float  # e.g., ₹3,000/mo x 3 months
    total_corridor_intervention_cost_lakhs: float
    cost_saving_vs_building_new_iti_lakhs: float
    corridor_policy_summary: str


class RelocationSimulationRequest(BaseModel):
    origin_district_code: str = Field(default="UP_KANPUR", description="Surplus district")
    destination_district_code: str = Field(default="MH_PUNE", description="Deficit district")
    nco_code: str = Field(default="7231.0200", description="Trade code")
    mobility_voucher_subsidy_per_candidate_inr: float = Field(default=9000.0, description="One-time 3-month relocation voucher in INR")
    target_relocation_quota: int = Field(default=350, description="Target number of candidates to migrate")


class RelocationSimulationResult(BaseModel):
    corridor_name: str
    origin_unemployment_reduction: int
    destination_shortage_fulfillment_pct: float
    total_scheme_outlay_lakhs: float
    capex_infrastructure_avoided_lakhs: float
    net_government_savings_lakhs: float
    roi_multiple: float
    policy_verdict: str
