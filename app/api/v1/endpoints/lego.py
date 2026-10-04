from typing import Optional
from fastapi import APIRouter, Query
from app.services.micro_credential import lego_micro_service, LegoPivotPlan

router = APIRouter()


@router.get("/pivot-recommendation", response_model=LegoPivotPlan)
def get_lego_pivot_recommendation(
    source_nco: str = Query("7411.0100", description="Oversupplied legacy base trade code"),
    target_nco: str = Query("7411.0300", description="High-deficit emerging target trade code"),
    district_code: str = Query("MH_PUNE", description="District code"),
    district_name: str = Query("Pune", description="District name"),
    surplus_trainees: int = Query(500, description="Number of surplus trainees to pivot")
):
    """
    'Lego-Block' Micro-Credential Pivot Recommendation Engine (Feature 3).
    When oversupply is detected, stacks hyper-specific 30-45 hour modular NSQF micro-credentials
    to existing training centers to instantly bridge local shortage while preserving 85%+ center infrastructure.
    """
    return lego_micro_service.generate_pivot_recommendation(
        source_nco=source_nco,
        target_nco=target_nco,
        district_code=district_code,
        district_name=district_name,
        surplus_trainees=surplus_trainees
    )
