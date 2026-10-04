from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class SimulationScenarioRequest(BaseModel):
    scenario_name: str = Field(default="Green & Electronics Expansion Plan", description="Name of policy scenario")
    target_sector_code: str = Field(default="GREEN_ENERGY", description="Sector to simulate")
    target_district_code: Optional[str] = Field(default=None, description="Optional specific district (None for all)")
    capex_injection_cr: float = Field(default=250.0, description="Additional industrial capex in INR Crores")
    additional_seats_sanctioned: int = Field(default=1200, description="Seats to add/shift across ITIs/PMKVY")
    training_stipend_boost_pct: float = Field(default=15.0, description="Trainee stipend boost percentage to increase enrollment")
    simulation_horizon_months: int = Field(default=24, description="Horizon: 12 or 24 months")


class TrajectoryPoint(BaseModel):
    month_offset: int
    period: str
    baseline_gap: int
    simulated_gap: int
    net_improvement: int


class SimulationScenarioResult(BaseModel):
    scenario_name: str
    target_sector: str
    target_district: str
    baseline_total_gap: int
    simulated_total_gap: int
    absolute_gap_reduction: int
    gap_mitigation_efficiency_pct: float
    projected_additional_placements: int
    estimated_cost_per_placed_candidate_inr: float
    policy_verdict: str
    monthly_trajectory: List[TrajectoryPoint]
