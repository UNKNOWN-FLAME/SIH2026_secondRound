from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.geography import District
from app.models.taxonomy import NCOOccupation, Sector
from app.models.demand import CompositeDemandRecord
from app.models.supply import TradePassoutMetric
from app.schemas.simulation import (
    SimulationScenarioRequest,
    SimulationScenarioResult
)
from app.services.simulation_engine import simulation_engine

router = APIRouter()


@router.post("/what-if", response_model=SimulationScenarioResult)
def run_what_if_simulation(
    request: SimulationScenarioRequest,
    period: Optional[str] = Query("2026-03", description="Baseline period"),
    db: Session = Depends(get_db)
):
    """
    Interactive What-If Policy Simulation Sandbox.
    Simulate the macro and localized impact of:
    - Capital expenditure injections into industrial parks / PLI clusters
    - Training seat quota alterations
    - Trainee incentive & stipend revisions
    Projects gap contraction trajectories across 12M and 24M horizons.
    """
    # 1. Fetch baseline demand for target sector / district
    d_query = (
        db.query(func.sum(CompositeDemandRecord.projected_headcount_demand))
        .join(NCOOccupation, CompositeDemandRecord.nco_code == NCOOccupation.nco_code)
        .filter(CompositeDemandRecord.period == period)
    )
    s_query = (
        db.query(func.sum(TradePassoutMetric.effective_local_supply))
        .join(NCOOccupation, TradePassoutMetric.nco_code == NCOOccupation.nco_code)
        .filter(TradePassoutMetric.period == period)
    )

    if request.target_sector_code:
        d_query = d_query.filter(NCOOccupation.sector_code == request.target_sector_code)
        s_query = s_query.filter(NCOOccupation.sector_code == request.target_sector_code)

    if request.target_district_code:
        d_query = d_query.filter(CompositeDemandRecord.district_code == request.target_district_code)
        s_query = s_query.filter(TradePassoutMetric.district_code == request.target_district_code)

    base_demand = d_query.scalar() or 3500
    base_supply = s_query.scalar() or 1800

    return simulation_engine.run_simulation(
        request=request,
        baseline_demand_total=int(base_demand),
        baseline_supply_total=int(base_supply)
    )


@router.get("/presets")
def get_simulation_presets():
    """Returns curated high-impact policy intervention presets for quick testing."""
    return [
        {
            "id": "PRESET_SOLAR_EV_ACCELERATION",
            "name": "PM Surya Ghar & EV Gigafactory Workforce Surge",
            "description": "Simulates sanctioning ₹450 Cr Capex and 2,500 additional Solar & EV technician seats with 20% stipend boost.",
            "params": {
                "scenario_name": "PM Surya Ghar & EV Gigafactory Workforce Surge",
                "target_sector_code": "GREEN_ENERGY",
                "target_district_code": "MH_PUNE",
                "capex_injection_cr": 450.0,
                "additional_seats_sanctioned": 2500,
                "training_stipend_boost_pct": 20.0,
                "simulation_horizon_months": 24
            }
        },
        {
            "id": "PRESET_SEMICONDUCTOR_ATMP",
            "name": "India Semiconductor Mission ATMP Sanand Expansion",
            "description": "Simulates ₹300 Cr investment in cleanroom & SMT packaging capacity in Gujarat.",
            "params": {
                "scenario_name": "India Semiconductor Mission ATMP Sanand Expansion",
                "target_sector_code": "ESDM",
                "target_district_code": "GJ_AHMEDABAD",
                "capex_injection_cr": 300.0,
                "additional_seats_sanctioned": 1800,
                "training_stipend_boost_pct": 15.0,
                "simulation_horizon_months": 24
            }
        },
        {
            "id": "PRESET_HEALTHCARE_EMERGENCY",
            "name": "State Emergency Trauma & Dialysis Augmentation",
            "description": "Simulates adding 1,200 emergency medical technician seats across Uttar Pradesh with 25% stipend boost.",
            "params": {
                "scenario_name": "State Emergency Trauma & Dialysis Augmentation",
                "target_sector_code": "HEALTHCARE",
                "target_district_code": "UP_LUCKNOW",
                "capex_injection_cr": 150.0,
                "additional_seats_sanctioned": 1200,
                "training_stipend_boost_pct": 25.0,
                "simulation_horizon_months": 12
            }
        }
    ]
