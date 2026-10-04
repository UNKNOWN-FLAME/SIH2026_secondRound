from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text
from app.core.database import Base


class PolicyTargetAllocation(Base):
    __tablename__ = "policy_target_allocations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    target_cycle = Column(String(20), nullable=False, default="2026-27")
    district_code = Column(String(30), ForeignKey("districts.code"), nullable=False, index=True)
    nco_code = Column(String(20), ForeignKey("nco_occupations.nco_code"), nullable=False, index=True)
    current_sanctioned_seats = Column(Integer, nullable=False)
    recommended_target_seats = Column(Integer, nullable=False)
    seat_delta = Column(Integer, nullable=False)
    seat_delta_pct = Column(Float, nullable=False)
    budget_impact_lakhs = Column(Float, nullable=False)
    policy_action = Column(String(50), nullable=False)  # "EXPAND_CAPACITY", "FREEZE_SEATS", "REDUCE_AND_BRIDGE", "MAINTAIN"
    rationale = Column(Text, nullable=False)


class SkillAdjacencyEdge(Base):
    __tablename__ = "skill_adjacency_edges"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_nco_code = Column(String(20), ForeignKey("nco_occupations.nco_code"), nullable=False, index=True)
    target_nco_code = Column(String(20), ForeignKey("nco_occupations.nco_code"), nullable=False, index=True)
    skill_overlap_pct = Column(Float, nullable=False)  # e.g., 72.5%
    skill_distance = Column(Float, nullable=False)     # 1 - (overlap / 100)
    shared_skills_json = Column(Text, nullable=False)  # JSON string of overlapping competencies
    gap_skills_json = Column(Text, nullable=False)     # JSON string of competencies needed to bridge
    recommended_bridge_weeks = Column(Integer, nullable=False, default=6) # 4 to 8 weeks
    target_nsqf_level = Column(Integer, nullable=False)
    feasibility_score = Column(Float, nullable=False, default=0.85)
