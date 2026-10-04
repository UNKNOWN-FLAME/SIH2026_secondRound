from typing import List, Optional
from pydantic import BaseModel, Field


class BillOfQualificationsItem(BaseModel):
    nco_code: str
    trade_title: str
    nsqf_level: int
    estimated_headcount_required: int
    deployment_phase_months: str
    critical_skills_required: List[str]


class TenderAnalysisResult(BaseModel):
    tender_id: str
    portal_source: str
    tender_title: str
    issuing_authority: str
    district_code: str
    district_name: str
    estimated_value_inr_cr: float
    work_category: str
    project_commencement_date: str
    lead_time_months_before_hiring: int
    total_projected_workforce: int
    bill_of_qualifications: List[BillOfQualificationsItem]
    msde_proactive_action_advisory: str
