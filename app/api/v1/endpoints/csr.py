from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Query, HTTPException
from app.services.csr_matchmaker import (
    csr_matchmaker_service,
    CSROpportunityItem,
    BankableDPRReport
)

router = APIRouter()


@router.get(
    "/opportunities",
    response_model=List[CSROpportunityItem],
    summary="List High-ROI CSR & Private Co-Investment Opportunities"
)
def list_csr_opportunities():
    """
    Curated pipeline matching corporate Section 135 CSR budgets to high-deficit
    trades in tier-1/tier-2 industrial districts with captive hiring pledges.
    """
    return csr_matchmaker_service.list_curated_opportunities()


@router.post(
    "/generate-bankable-dpr",
    response_model=BankableDPRReport,
    summary="Generate Bankable Detailed Project Report (DPR) & Term Sheet"
)
def generate_bankable_dpr(
    district_code: str = Query("MH_PUNE", description="Target district LGD code"),
    corporate_partner: str = Query("Tata Motors CSR Foundation", description="Corporate partner organization"),
    target_nco_code: str = Query("7231.0200", description="Target high-demand trade NCO code")
):
    """
    Auto-generates a ready-to-sign tri-partite Detailed Project Report (DPR)
    specifying capex share, government in-kind commitments, 5-year graduate cohorts, and verified SROI.
    """
    return csr_matchmaker_service.generate_bankable_dpr(
        district_code=district_code,
        corporate_partner=corporate_partner,
        target_nco_code=target_nco_code
    )


@router.get(
    "/sroi-calculator",
    summary="Dynamic Social Return on Investment (SROI) & Wage-Multiplier Calculator"
)
def calculate_custom_sroi(
    csr_grant_lakhs: float = Query(45.0, description="Proposed corporate CSR grant in ₹ Lakhs", gt=1.0),
    annual_trainees: int = Query(300, description="Annual youth training capacity", ge=10),
    baseline_monthly_wage: float = Query(12000.0, description="Unskilled/informal baseline monthly wage in INR", ge=5000.0),
    post_certified_monthly_wage: float = Query(26000.0, description="Certified technician starting monthly wage in INR", ge=10000.0),
    tenure_years: int = Query(5, description="Economic horizon in years", ge=1, le=10)
):
    """
    Calculates quantifiable lifetime economic wage uplift generated for underprivileged youth
    per rupee of corporate CSR capital invested.
    """
    return csr_matchmaker_service.calculate_custom_sroi(
        csr_grant_lakhs=csr_grant_lakhs,
        annual_trainees=annual_trainees,
        baseline_monthly_wage=baseline_monthly_wage,
        post_certified_monthly_wage=post_certified_monthly_wage,
        tenure_years=tenure_years
    )
