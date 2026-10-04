import json
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.taxonomy import NCOOccupation
from app.models.policy import SkillAdjacencyEdge
from app.schemas.skill_graph import (
    BridgeCourseRecommendationOut,
    SkillGraphNetworkResponse
)
from app.services.skill_graph_engine import skill_graph_engine

router = APIRouter()


def _ensure_graph_loaded(db: Session):
    if len(skill_graph_engine.occupations_dict) < 5 or skill_graph_engine.graph.number_of_edges() == 0:
        occs = db.query(NCOOccupation).all()
        if not occs:
            raise HTTPException(status_code=503, detail="Taxonomy not seeded.")
        occ_list = [
            {
                "nco_code": o.nco_code,
                "title": o.title,
                "sector_code": o.sector_code,
                "nsqf_level": o.nsqf_level,
                "core_skills": o.core_skills,
                "is_emerging": o.is_emerging,
                "is_legacy_at_risk": o.is_legacy_at_risk
            }
            for o in occs
        ]

        # Load database bridge edges
        edges = db.query(SkillAdjacencyEdge).all()
        edge_data = [
            {
                "source": e.source_nco_code,
                "target": e.target_nco_code,
                "overlap_pct": e.skill_overlap_pct,
                "weight": e.skill_distance,
                "bridge_weeks": e.recommended_bridge_weeks,
                "shared_skills": json.loads(e.shared_skills_json) if e.shared_skills_json.startswith("[") else [e.shared_skills_json],
                "missing_skills": json.loads(e.gap_skills_json) if e.gap_skills_json.startswith("[") else [e.gap_skills_json]
            }
            for e in edges
        ]

        skill_graph_engine.load_taxonomy(occ_list, edge_data)


@router.get("/bridge-recommendations", response_model=BridgeCourseRecommendationOut)
def get_bridge_recommendations(
    source_nco_code: str = Query(..., description="NCO code of the oversupplied trade (e.g. '7231.0100' for Diesel Mechanic)"),
    surplus_candidates: int = Query(500, description="Total surplus candidates to transition"),
    db: Session = Depends(get_db)
):
    """
    Skill Adjacency & Bridge-Course Recommender (Winning Pillar 2).
    Maps saturated legacy trades to emerging high-growth trades based on competency
    overlap, calculates shortest skill distance, and recommends NSQF-aligned bridge courses.
    """
    _ensure_graph_loaded(db)
    return skill_graph_engine.get_bridge_recommendations(source_nco_code, surplus_candidates=surplus_candidates)


@router.get("/network", response_model=SkillGraphNetworkResponse)
def get_skill_network_topology(db: Session = Depends(get_db)):
    """
    Retrieve full skill transferability graph topology (Nodes & Directed Edges)
    for interactive frontend network visualization.
    """
    _ensure_graph_loaded(db)
    return skill_graph_engine.get_network_topology()
