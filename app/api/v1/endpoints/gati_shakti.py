from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Query, HTTPException
from app.services.gati_shakti import (
    gati_shakti_service,
    GatiShaktiCorridorNode,
    CatchmentAuditReport
)

router = APIRouter()


@router.get(
    "/corridors",
    response_model=List[GatiShaktiCorridorNode],
    summary="List all PM Gati-Shakti Multi-Modal Infrastructure Corridors"
)
def list_gati_shakti_corridors():
    """
    Returns active national infrastructure corridor nodes (DFCs, MMLPs, Expressway Hubs)
    mapped with GPS, capex, and multi-modal logistics workforce projections.
    """
    return gati_shakti_service.list_all_corridor_nodes()


@router.get(
    "/catchment-audit",
    response_model=CatchmentAuditReport,
    summary="Audit 50km Catchment Area ITI Readiness & Workforce Deficit"
)
def audit_gati_shakti_catchment(
    node_id_or_district: str = Query(
        "MH_PUNE",
        description="Corridor Node ID (e.g., 'GS-NODE-WDFC-PUNE') or District Code (e.g., 'MH_PUNE', 'UP_KANPUR', 'GJ_AHMEDABAD')"
    ),
    catchment_radius_km: float = Query(
        50.0,
        description="Geographic catchment buffer radius in km",
        ge=10.0,
        le=150.0
    )
):
    """
    Audits the 50km spatial catchment radius around a mega-infrastructure project,
    evaluating existing ITI/PMKK infrastructure readiness and calculating capex needed for upgrade.
    """
    return gati_shakti_service.audit_catchment_area(
        node_id_or_district=node_id_or_district,
        catchment_radius_km=catchment_radius_km
    )


@router.post(
    "/simulate-corridor-expansion",
    summary="Simulate Workforce Demand for a New Infrastructure Project"
)
def simulate_corridor_expansion(
    project_title: str = Query("Purvanchal Expressway Logistics Anchor Hub", description="Name of proposed infrastructure project"),
    district_code: str = Query("UP_KANPUR", description="Target district LGD code"),
    investment_inr_cr: float = Query(1500.0, description="Estimated project capex in ₹ Crores", gt=10.0),
    hub_type: str = Query("Multi-Modal Logistics Park (MMLP)", description="Infrastructure type")
):
    """
    What-if simulation: Enter proposed Gati-Shakti project investment to instantly derive
    specialized multi-modal headcount and required ITI lab capex.
    """
    return gati_shakti_service.simulate_corridor_expansion(
        project_title=project_title,
        district_code=district_code,
        investment_inr_cr=investment_inr_cr,
        hub_type=hub_type
    )
