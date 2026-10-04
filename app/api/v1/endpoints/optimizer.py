from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import require_role
from app.models.geography import District
from app.models.taxonomy import NCOOccupation
from app.models.demand import CompositeDemandRecord
from app.models.supply import TradePassoutMetric
from app.schemas.policy import OptimizerRequest, OptimizationSummary
from app.services.optimizer_engine import target_optimizer_engine

router = APIRouter()


@router.post("/optimize", response_model=OptimizationSummary)
def optimize_training_targets(
    request: OptimizerRequest,
    period: Optional[str] = Query("2026-03", description="Base demand/capacity period"),
    db: Session = Depends(get_db),
    user: dict = Depends(require_role(["MSDE_ADMIN"]))
):
    """
    Autonomous Policy Target Optimizer (Winning Pillar 3).
    Formulates and solves a constrained optimization model to determine
    the mathematically optimal annual seat allocations per trade and district,
    respecting maximum delta capacity ceilings (+/- 20%) and MSDE budget caps.
    """
    # 1. Fetch current seats and projected demand for all trades
    query = (
        db.query(
            TradePassoutMetric.district_code,
            TradePassoutMetric.nco_code,
            TradePassoutMetric.annual_seat_capacity.label("current_seats"),
            CompositeDemandRecord.projected_headcount_demand.label("projected_demand"),
            District.name.label("district_name"),
            District.state_code,
            NCOOccupation.title.label("trade_title"),
            NCOOccupation.sector_code
        )
        .join(
            CompositeDemandRecord,
            (TradePassoutMetric.district_code == CompositeDemandRecord.district_code) &
            (TradePassoutMetric.nco_code == CompositeDemandRecord.nco_code) &
            (TradePassoutMetric.period == CompositeDemandRecord.period)
        )
        .join(District, TradePassoutMetric.district_code == District.code)
        .join(NCOOccupation, TradePassoutMetric.nco_code == NCOOccupation.nco_code)
        .filter(TradePassoutMetric.period == period)
    )

    if request.target_state_code:
        query = query.filter(District.state_code == request.target_state_code)

    rows = query.all()
    if not rows:
        raise HTTPException(status_code=404, detail="No training capacity records found for target period.")

    current_data = [
        {
            "district_code": r.district_code,
            "district_name": r.district_name,
            "nco_code": r.nco_code,
            "trade_title": r.trade_title,
            "sector_code": r.sector_code,
            "current_seats": r.current_seats,
            "projected_demand": r.projected_demand
        }
        for r in rows
    ]

    return target_optimizer_engine.optimize_allocations(current_data, request)
