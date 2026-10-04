from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.cache import cache_response
from app.models.geography import District
from app.models.taxonomy import NCOOccupation
from app.models.demand import CompositeDemandRecord
from app.models.supply import TradePassoutMetric
from app.schemas.mismatch import MismatchDashboardResponse
from app.services.mismatch_engine import mismatch_engine

router = APIRouter()


@router.get("/dashboard", response_model=MismatchDashboardResponse)
@cache_response(expire=1800)  # 30 mins cache
async def get_mismatch_dashboard(
    request: Request,
    period: Optional[str] = "2026-03",
    state_code: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Early-Warning Mismatch Diagnostic Dashboard.
    Ranks trades by severity of deficit or surplus, generates automated alerts,
    and provides district geographic stress heatmaps.
    """
    # 1. Fetch all districts metadata
    districts = db.query(District).all()
    dist_meta = {
        d.code: {
            "name": d.name,
            "state_code": d.state_code,
            "latitude": d.latitude,
            "longitude": d.longitude,
            "industrial_focus": d.industrial_focus
        }
        for d in districts
    }

    # 2. Join demand and supply records for the target period
    query = (
        db.query(
            CompositeDemandRecord.district_code,
            CompositeDemandRecord.nco_code,
            CompositeDemandRecord.projected_headcount_demand,
            TradePassoutMetric.effective_local_supply,
            District.name.label("district_name"),
            District.state_code,
            NCOOccupation.title.label("trade_title"),
            NCOOccupation.sector_code
        )
        .join(
            TradePassoutMetric,
            (CompositeDemandRecord.district_code == TradePassoutMetric.district_code) &
            (CompositeDemandRecord.nco_code == TradePassoutMetric.nco_code) &
            (CompositeDemandRecord.period == TradePassoutMetric.period)
        )
        .join(District, CompositeDemandRecord.district_code == District.code)
        .join(NCOOccupation, CompositeDemandRecord.nco_code == NCOOccupation.nco_code)
        .filter(CompositeDemandRecord.period == period)
    )

    if state_code:
        query = query.filter(District.state_code == state_code)

    raw_rows = query.all()

    record_dicts = []
    for row in raw_rows:
        record_dicts.append({
            "district_code": row.district_code,
            "district_name": row.district_name,
            "state_code": row.state_code,
            "nco_code": row.nco_code,
            "trade_title": row.trade_title,
            "sector_code": row.sector_code,
            "demand": row.projected_headcount_demand,
            "supply": row.effective_local_supply
        })

    return mismatch_engine.generate_dashboard(record_dicts, dist_meta)


@router.get("/district/{district_code}")
def get_district_mismatch_drilldown(
    district_code: str,
    period: Optional[str] = "2026-03",
    db: Session = Depends(get_db)
):
    """Deep drill-down into a single district's trades."""
    district = db.query(District).filter(District.code == district_code).first()
    if not district:
        raise HTTPException(status_code=404, detail="District not found.")

    res = get_mismatch_dashboard(period=period, state_code=None, db=db)
    
    district_shortages = [i for i in res.top_undersupplied_trades if i.district_code == district_code]
    district_surpluses = [i for i in res.top_oversupplied_trades if i.district_code == district_code]
    district_warnings = [w for w in res.active_early_warnings if district.name in w.district_name or district_code in w.alert_id]

    return {
        "district_code": district.code,
        "district_name": district.name,
        "state_code": district.state_code,
        "industrial_focus": district.industrial_focus,
        "coordinates": {"lat": district.latitude, "lng": district.longitude},
        "shortages": district_shortages,
        "surpluses": district_surpluses,
        "early_warnings": district_warnings
    }
