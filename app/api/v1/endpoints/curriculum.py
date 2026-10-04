from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.taxonomy import NCOOccupation
from app.schemas.curriculum import (
    CurriculumObsolescenceAuditOut,
    CurriculumRevisionAddendumOut
)
from app.services.curriculum_analyzer import curriculum_analyzer_service, CURRICULUM_BENCHMARKS

router = APIRouter()


@router.get("/audit/{nco_code}", response_model=CurriculumObsolescenceAuditOut)
def audit_curriculum_obsolescence(
    nco_code: str,
    db: Session = Depends(get_db)
):
    """
    NCVET Curriculum Obsolescence Audit (Winning Feature 1).
    Evaluates official government qualification pack syllabus against real-time
    industry hiring signals. Identifies decaying modules and missing competencies.
    """
    occ = db.query(NCOOccupation).filter(NCOOccupation.nco_code == nco_code).first()
    if not occ:
        raise HTTPException(status_code=404, detail="Trade NCO code not found in directory.")

    return curriculum_analyzer_service.audit_trade(nco_code)


@router.get("/high-risk-trades", response_model=List[CurriculumObsolescenceAuditOut])
def get_high_risk_obsolete_trades(
    min_obsolescence_pct: float = Query(25.0, description="Minimum obsolescence threshold %"),
    db: Session = Depends(get_db)
):
    """
    National ranking of trades with highest curriculum obsolescence.
    Used by NCVET syllabus committees to prioritize trades for emergency revision.
    """
    results: List[CurriculumObsolescenceAuditOut] = []
    for code in CURRICULUM_BENCHMARKS.keys():
        audit = curriculum_analyzer_service.audit_trade(code)
        if audit.obsolescence_rate_pct >= min_obsolescence_pct:
            results.append(audit)

    return sorted(results, key=lambda x: x.obsolescence_rate_pct, reverse=True)


@router.post("/generate-revision-addendum", response_model=CurriculumRevisionAddendumOut)
def generate_ncvet_revision_addendum(
    nco_code: str = Query(..., description="NCO code of the trade requiring revision addendum"),
    db: Session = Depends(get_db)
):
    """
    Auto-Generates Official NCVET Curriculum Revision Addendum & Lab Upgrade Memo.
    Produces an actionable draft memo ready for Ministry circulars and DSDO lab modernization sanctions.
    """
    occ = db.query(NCOOccupation).filter(NCOOccupation.nco_code == nco_code).first()
    if not occ:
        raise HTTPException(status_code=404, detail="Trade NCO code not found.")

    return curriculum_analyzer_service.generate_revision_addendum(nco_code)
