from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Query, HTTPException
from app.services.obsolescence_radar import (
    obsolescence_radar_service,
    TradeObsolescenceProfile,
    DistrictVulnerabilityReport,
    PreemptivePathwayPlan
)

router = APIRouter()


@router.get(
    "/trade-risk-matrix",
    response_model=List[TradeObsolescenceProfile],
    summary="Rank NCO Occupations by AI Automation & Obsolescence Velocity Score"
)
def get_trade_risk_matrix():
    """
    Returns full ranking of occupations analyzed for automation vulnerability,
    routineness index, technology displacement drivers, and target pivot trades.
    """
    return obsolescence_radar_service.get_trade_risk_matrix()


@router.get(
    "/district-vulnerability",
    response_model=DistrictVulnerabilityReport,
    summary="Scan District for Automation-Vulnerable Headcount & Layoff Threat"
)
def assess_district_vulnerability(
    district_code: str = Query("MH_PUNE", description="District LGD code"),
    district_name: str = Query("Pune", description="District display name")
):
    """
    Evaluates how many workers in a given district are exposed to critical automation risk
    over the next 12-18 months and generates an actionable early warning alert.
    """
    return obsolescence_radar_service.assess_district_vulnerability(
        district_code=district_code,
        district_name=district_name
    )


@router.post(
    "/generate-preemptive-pathway",
    response_model=PreemptivePathwayPlan,
    summary="Generate Pre-Emptive Micro-Credential Reskilling Pathway"
)
def generate_preemptive_pathway(
    source_nco_code: str = Query("4132.0100", description="At-risk NCO trade code (e.g., '4132.0100' Data Entry, '7231.0100' Diesel Mechanic)")
):
    """
    Generates a turn-key modular reskilling curriculum roadmap to pivot at-risk workers
    into future-proof emerging roles before automated retrenchment happens.
    """
    return obsolescence_radar_service.generate_preemptive_pathway(
        source_nco_code=source_nco_code
    )
