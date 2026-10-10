from typing import List, Optional
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.cache import cache_response
from app.models.geography import District
from app.models.taxonomy import NCOOccupation, Sector
from app.models.demand import JobPostingSignal, IndustrialCapexSignal, CompositeDemandRecord
from app.schemas.demand import (
    JobPostingSignalOut,
    IndustrialCapexSignalOut,
    CDIBreakdown,
    DemandSummaryOut
)

router = APIRouter()


@router.get("/signals", response_model=List[JobPostingSignalOut])
def get_job_posting_signals(
    district_code: Optional[str] = None,
    nco_code: Optional[str] = None,
    period: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Retrieve raw job posting signals across time periods."""
    query = db.query(JobPostingSignal)
    if district_code:
        query = query.filter(JobPostingSignal.district_code == district_code)
    if nco_code:
        query = query.filter(JobPostingSignal.nco_code == nco_code)
    if period:
        query = query.filter(JobPostingSignal.period == period)
    return query.order_by(JobPostingSignal.period.desc()).offset(skip).limit(min(limit, 200)).all()


@router.get("/capex", response_model=List[IndustrialCapexSignalOut])
def get_industrial_capex_signals(
    district_code: Optional[str] = None,
    sector_code: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve lead-indicator Industrial Capex and PLI scheme projects."""
    query = db.query(IndustrialCapexSignal)
    if district_code:
        query = query.filter(IndustrialCapexSignal.district_code == district_code)
    if sector_code:
        query = query.filter(IndustrialCapexSignal.sector_code == sector_code)
    return query.all()


def _get_cdi_breakdowns(
    db: Session,
    district_code: Optional[str] = None,
    nco_code: Optional[str] = None,
    period: Optional[str] = "2026-03",
) -> List[CDIBreakdown]:
    query = (
        db.query(
            CompositeDemandRecord,
            District.name.label("district_name"),
            NCOOccupation.title.label("trade_title")
        )
        .join(District, CompositeDemandRecord.district_code == District.code)
        .join(NCOOccupation, CompositeDemandRecord.nco_code == NCOOccupation.nco_code)
    )

    if district_code:
        query = query.filter(CompositeDemandRecord.district_code == district_code)
    if nco_code:
        query = query.filter(CompositeDemandRecord.nco_code == nco_code)
    if period:
        query = query.filter(CompositeDemandRecord.period == period)

    results = query.order_by(CompositeDemandRecord.cdi_score.desc()).all()

    breakdowns = []
    for rec, d_name, t_title in results:
        breakdowns.append(
            CDIBreakdown(
                district_code=rec.district_code,
                district_name=d_name,
                nco_code=rec.nco_code,
                trade_title=t_title,
                period=rec.period,
                posting_component=rec.posting_component,
                capex_component=rec.capex_component,
                velocity_component=rec.velocity_component,
                wage_component=rec.wage_component,
                migration_component=rec.migration_component,
                cdi_score=rec.cdi_score,
                projected_headcount_demand=rec.projected_headcount_demand
            )
        )
    return breakdowns


@router.get("/cdi", response_model=List[CDIBreakdown])
@cache_response(expire=3600)  # 1 hour cache
async def get_composite_demand_index(
    request: Request,
    district_code: Optional[str] = None,
    nco_code: Optional[str] = None,
    period: Optional[str] = "2026-03",
    db: Session = Depends(get_db)
):
    """
    Retrieve Composite Demand Index (CDI) multi-modal breakdown:
    Postings (30%) + Capex (35%) + Velocity (15%) + Wages (10%) + Migration (10%).
    """
    return _get_cdi_breakdowns(db=db, district_code=district_code, nco_code=nco_code, period=period)


@router.get("/summary", response_model=DemandSummaryOut)
def get_demand_summary(
    period: Optional[str] = "2026-03",
    db: Session = Depends(get_db)
):
    """Executive macro summary of labour market demand."""
    total_postings = (
        db.query(func.sum(JobPostingSignal.active_postings))
        .filter(JobPostingSignal.period == period)
        .scalar() or 0
    )

    total_capex = db.query(func.sum(IndustrialCapexSignal.investment_inr_cr)).scalar() or 0.0
    total_direct_jobs = db.query(func.sum(IndustrialCapexSignal.expected_direct_jobs)).scalar() or 0

    avg_cdi = (
        db.query(func.avg(CompositeDemandRecord.cdi_score))
        .filter(CompositeDemandRecord.period == period)
        .scalar() or 50.0
    )

    # Top 5 demanded trades
    top_cdi_recs = _get_cdi_breakdowns(db=db, district_code=None, nco_code=None, period=period)[:5]

    return DemandSummaryOut(
        total_active_postings=int(total_postings),
        total_capex_cr=float(total_capex),
        total_projected_direct_jobs=int(total_direct_jobs),
        average_cdi=round(float(avg_cdi), 1),
        top_demanded_trades=top_cdi_recs
    )
