from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.geography import State, District
from app.models.taxonomy import Sector, NCOOccupation
from app.schemas.taxonomy import SectorOut, NCOOccupationOut, NCOMatchRequest, NCOMatchResponse
from app.services.nco_matcher import nco_matcher_service

router = APIRouter()


@router.get("/states")
def get_all_states(db: Session = Depends(get_db)):
    """Fetch all supported States in the national skilling directory."""
    states = db.query(State).all()
    return [{"code": s.code, "name": s.name, "capital": s.capital} for s in states]


@router.get("/districts")
def get_all_districts(
    state_code: Optional[str] = Query(None, description="Filter districts by state code (e.g. 'MH', 'UP')"),
    db: Session = Depends(get_db)
):
    """Fetch districts with official LGD codes, geographic coordinates, and industrial cluster focus."""
    query = db.query(District)
    if state_code:
        query = query.filter(District.state_code == state_code)
    districts = query.all()
    return [
        {
            "code": d.code,
            "lgd_code": d.lgd_code,
            "name": d.name,
            "state_code": d.state_code,
            "tier": d.tier,
            "latitude": d.latitude,
            "longitude": d.longitude,
            "industrial_focus": d.industrial_focus
        }
        for d in districts
    ]


@router.get("/sectors", response_model=List[SectorOut])
def get_all_sectors(db: Session = Depends(get_db)):
    """Fetch all 4 pilot priority sectors with Sector Skill Council (SSC) references."""
    return db.query(Sector).all()


@router.get("/occupations", response_model=List[NCOOccupationOut])
def get_all_occupations(
    sector_code: Optional[str] = Query(None, description="Filter by sector code"),
    is_emerging: Optional[bool] = Query(None, description="Filter for emerging high-demand trades"),
    is_legacy_at_risk: Optional[bool] = Query(None, description="Filter for legacy trades facing saturation"),
    db: Session = Depends(get_db)
):
    """Fetch official NCO-2015 occupational trades with NSQF levels and core competencies."""
    query = db.query(NCOOccupation)
    if sector_code:
        query = query.filter(NCOOccupation.sector_code == sector_code)
    if is_emerging is not None:
        query = query.filter(NCOOccupation.is_emerging == is_emerging)
    if is_legacy_at_risk is not None:
        query = query.filter(NCOOccupation.is_legacy_at_risk == is_legacy_at_risk)
    return query.all()


@router.post("/match-job", response_model=NCOMatchResponse)
def match_unstructured_job(
    request: NCOMatchRequest,
    db: Session = Depends(get_db)
):
    """
    AI Semantic NCO Mapper.
    Takes raw job postings, job descriptions, or syllabus titles and auto-maps
    to official NCO-2015 4/8-digit codes and NSQF levels using TF-IDF + Cosine similarity.
    """
    # Ensure matcher index is loaded
    if not nco_matcher_service.is_fitted:
        occupations = db.query(NCOOccupation).all()
        if not occupations:
            raise HTTPException(status_code=503, detail="Taxonomy not seeded yet.")
        nco_matcher_service.build_index(occupations)

    return nco_matcher_service.match(request.query_text, top_k=request.top_k)
