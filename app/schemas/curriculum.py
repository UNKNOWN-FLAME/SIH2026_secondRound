from typing import List, Optional
from pydantic import BaseModel, Field


class OutdatedModuleItem(BaseModel):
    module_name: str
    decay_score: float  # 0 to 100 (higher means more obsolete)
    reason: str


class MissingSkillItem(BaseModel):
    skill_name: str
    industry_demand_frequency_pct: float  # Percentage of modern job postings asking for this
    urgency_level: str  # "HIGH", "CRITICAL"
    recommended_training_hours: int


class CurriculumObsolescenceAuditOut(BaseModel):
    nco_code: str
    trade_title: str
    sector_code: str
    current_nsqf_level: int
    syllabus_last_revised_year: int
    alignment_score_pct: float         # e.g., 62% alignment with modern job postings
    obsolescence_rate_pct: float        # 100 - alignment_score
    obsolescence_risk_level: str        # "HIGH_RISK", "MODERATE_RISK", "CURRENT"
    outdated_modules: List[OutdatedModuleItem]
    critical_missing_competencies: List[MissingSkillItem]
    lab_equipment_gap: List[str]
    ncvet_revision_urgency: str
    executive_recommendation: str


class CurriculumRevisionAddendumOut(BaseModel):
    nco_code: str
    trade_title: str
    proposed_nsqf_level: int
    revision_reference_code: str
    addendum_title: str
    new_modules_to_integrate: List[MissingSkillItem]
    legacy_modules_to_deprecate: List[str]
    required_lab_infrastructure_upgrades: List[str]
    estimated_implementation_cost_per_center_inr: float
    official_memo_draft: str
