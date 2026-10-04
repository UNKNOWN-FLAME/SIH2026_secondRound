from typing import Optional
from fastapi import APIRouter, Query
from app.services.material_proxy import material_proxy_service, MaterialProxyReport

router = APIRouter()


@router.get("/material-consumption", response_model=MaterialProxyReport)
def get_material_consumption_proxy(
    district_code: str = Query("MH_PUNE", description="Target district code"),
    district_name: str = Query("Pune", description="Target district name"),
    period: str = Query("2026-03", description="Reporting month (YYYY-MM)"),
    consumption_surge_multiplier: float = Query(1.22, description="Month-on-Month consumption surge factor (e.g. 1.22 for +22% surge)")
):
    """
    Informal Sector Proxy Tracking via Material Consumption (Feature 2).
    Tracks localized wholesale cement, TMT steel, lithium battery imports, and solar panel
    dispatches at district level to predict unorganized informal workforce demand without job ads.
    """
    return material_proxy_service.generate_district_informal_demand(
        district_code=district_code,
        district_name=district_name,
        period=period,
        consumption_multiplier=consumption_surge_multiplier
    )
