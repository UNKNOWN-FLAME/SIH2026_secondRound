from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any
from app.core.auth import require_role

router = APIRouter()

@router.get("/ncs/vacancies", response_model=List[Dict[str, Any]])
def sync_ncs_vacancies(
    district_code: str = Query(..., description="Target district code"),
    limit: int = Query(50, description="Number of latest vacancies to pull"),
    user: dict = Depends(require_role(["MSDE_ADMIN", "STATE_PLANNER"]))
):
    """
    STUB: Syncs real-time job vacancy data from the National Career Service (NCS) API.
    """
    return [
        {
            "job_id": "NCS-2026-X1992",
            "nco_code": "7231.0200",
            "title": "EV Technician",
            "vacancies": 12,
            "district_code": district_code,
            "salary_min": 18000,
            "salary_max": 25000,
            "source": "NCS_API"
        }
    ]

@router.get("/eshram/migrants", response_model=List[Dict[str, Any]])
def sync_eshram_migrant_data(
    state_code: str = Query(..., description="State code to pull migration data for"),
    user: dict = Depends(require_role(["MSDE_ADMIN"]))
):
    """
    STUB: Syncs inbound/outbound informal worker mobility data from e-Shram API.
    """
    return [
        {
            "state_code": state_code,
            "nco_code": "7111.0100",
            "trade": "General Mason",
            "inbound_count": 4500,
            "outbound_count": 1200,
            "net_migration": 3300,
            "source": "eShram_API"
        }
    ]
