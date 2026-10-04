from typing import List
from pydantic import BaseModel


class SkillAdjacencyDetail(BaseModel):
    target_nco_code: str
    target_trade_title: str
    target_sector: str
    target_nsqf_level: int
    skill_overlap_pct: float
    skill_distance: float
    shared_skills: List[str]
    missing_gap_skills: List[str]
    recommended_bridge_weeks: int
    feasibility_score: float
    target_market_demand_status: str


class BridgeCourseRecommendationOut(BaseModel):
    source_nco_code: str
    source_trade_title: str
    source_status: str  # "CHRONIC_SATURATION" or "MILD_SURPLUS"
    total_surplus_candidates_district: int
    adjacent_transition_pathways: List[SkillAdjacencyDetail]
    policy_summary: str


class GraphNode(BaseModel):
    id: str
    label: str
    sector: str
    nsqf_level: int
    status: str  # "SHORTAGE", "SURPLUS", "BALANCED"


class GraphEdge(BaseModel):
    source: str
    target: str
    overlap_pct: float
    bridge_weeks: int


class SkillGraphNetworkResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
