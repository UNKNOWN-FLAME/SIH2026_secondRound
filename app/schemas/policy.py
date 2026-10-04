from typing import List, Optional
from pydantic import BaseModel, Field


class OptimizerRequest(BaseModel):
    target_cycle: str = Field(default="2026-27", description="Scheme allocation cycle")
    max_seat_variation_pct: float = Field(default=20.0, description="Max allowed capacity variation (+/- %)")
    total_budget_cap_cr: Optional[float] = Field(default=500.0, description="Total budget ceiling in INR Crores")
    target_state_code: Optional[str] = Field(default=None, description="Optional state filter")


class AllocationRow(BaseModel):
    district_code: str
    district_name: str
    nco_code: str
    trade_title: str
    sector_code: str
    current_seats: int
    recommended_seats: int
    delta_seats: int
    delta_pct: float
    projected_demand: int
    residual_gap: int
    action: str
    estimated_cost_lakhs: float
    rationale: str


class OptimizationSummary(BaseModel):
    target_cycle: str
    total_trades_optimized: int
    total_current_seats: int
    total_recommended_seats: int
    net_seat_addition: int
    projected_gap_reduction_pct: float
    total_budget_allocated_cr: float
    allocations: List[AllocationRow]
