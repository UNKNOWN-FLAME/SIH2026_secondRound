from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.geography import District
from app.models.taxonomy import NCOOccupation
from app.models.supply import TrainingCenter, TradeCapacity, TradePassoutMetric
from app.schemas.supply import (
    TrainingCenterOut,
    TradeCapacityOut,
    EffectiveSupplyBreakdown,
    SupplySummaryOut
)

router = APIRouter()


@router.get("/centers", response_model=List[TrainingCenterOut])
def get_training_centers(
    district_code: Optional[str] = None,
    center_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve accredited ITIs, PMKKs, and NSTI training centers."""
    query = db.query(TrainingCenter)
    if district_code:
        query = query.filter(TrainingCenter.district_code == district_code)
    if center_type:
        query = query.filter(TrainingCenter.center_type == center_type)
    return query.all()


@router.get("/effective", response_model=List[EffectiveSupplyBreakdown])
def get_effective_supply_breakdown(
    district_code: Optional[str] = None,
    nco_code: Optional[str] = None,
    period: Optional[str] = "2026-03",
    db: Session = Depends(get_db)
):
    """
    Retrieve realistic Effective Local Supply:
    Sanctioned seats discounted by completion (passout) rate, local retention,
    inter-district out-migration, and qualified e-Shram unorganized seekers.
    """
    query = (
        db.query(
            TradePassoutMetric,
            District.name.label("district_name"),
            NCOOccupation.title.label("trade_title")
        )
        .join(District, TradePassoutMetric.district_code == District.code)
        .join(NCOOccupation, TradePassoutMetric.nco_code == NCOOccupation.nco_code)
    )

    if district_code:
        query = query.filter(TradePassoutMetric.district_code == district_code)
    if nco_code:
        query = query.filter(TradePassoutMetric.nco_code == nco_code)
    if period:
        query = query.filter(TradePassoutMetric.period == period)

    results = query.all()
    breakdowns = []
    for m, d_name, t_title in results:
        breakdowns.append(
            EffectiveSupplyBreakdown(
                district_code=m.district_code,
                district_name=d_name,
                nco_code=m.nco_code,
                trade_title=t_title,
                period=m.period,
                annual_seat_capacity=m.annual_seat_capacity,
                certified_passouts=m.certified_passouts,
                pass_completion_rate=m.pass_completion_rate,
                local_placement_absorption_rate=m.local_placement_absorption_rate,
                interdistrict_migration_rate=m.interdistrict_migration_rate,
                unorganized_eshram_pool=m.unorganized_eshram_pool,
                effective_local_supply=m.effective_local_supply
            )
        )
    return breakdowns


@router.get("/summary", response_model=SupplySummaryOut)
def get_supply_summary(
    period: Optional[str] = "2026-03",
    db: Session = Depends(get_db)
):
    """Executive macro summary of institutional training capacity and effective passouts."""
    total_centers = db.query(func.count(TrainingCenter.id)).scalar() or 0
    total_seats = (
        db.query(func.sum(TradePassoutMetric.annual_seat_capacity))
        .filter(TradePassoutMetric.period == period)
        .scalar() or 0
    )
    total_passouts = (
        db.query(func.sum(TradePassoutMetric.certified_passouts))
        .filter(TradePassoutMetric.period == period)
        .scalar() or 0
    )
    total_eff_supply = (
        db.query(func.sum(TradePassoutMetric.effective_local_supply))
        .filter(TradePassoutMetric.period == period)
        .scalar() or 0
    )

    trade_items = get_effective_supply_breakdown(district_code=None, nco_code=None, period=period, db=db)

    return SupplySummaryOut(
        total_training_centers=int(total_centers),
        total_sanctioned_seats=int(total_seats),
        total_enrolled_trainees=int(round(total_seats * 0.88)),
        total_certified_passouts=int(total_passouts),
        total_effective_supply=int(total_eff_supply),
        trades=trade_items
    )
