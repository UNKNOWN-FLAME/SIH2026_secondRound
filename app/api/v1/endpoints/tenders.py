from typing import List, Optional
from fastapi import APIRouter, Query, Body
from app.schemas.tenders import TenderAnalysisResult, BillOfQualificationsItem
from app.services.tender_nlp import tender_nlp_service

router = APIRouter()


@router.post("/parse-and-extract-boq", response_model=TenderAnalysisResult)
def parse_government_tender(
    tender_id: str = Query("GEM/2026/B/894102", description="GeM or CPPP tender ID"),
    tender_title: str = Query("Turnkey Installation of 150MW Solar Ground Mount Park & Transmission Line", description="Official tender subject"),
    scope_description: str = Query("Civil mounting, 33kV substation bay erection, grid interconnection, and inverter telemetry maintenance", description="Work scope details"),
    tender_value_cr: float = Query(280.0, description="Tender value in INR Crores"),
    district_code: str = Query("MH_NAGPUR", description="Execution district code"),
    district_name: str = Query("Nagpur", description="Execution district name"),
    portal_source: str = Query("GeM", description="GeM or CPPP")
):
    """
    Forward-Predictive NLP on Government Procurement Tenders (Feature 1).
    Scrapes/parses GeM & CPPP approved tender scopes, translates them into a
    'Bill of Qualifications' (BoQ), and gives MSDE a 6-12 month proactive seat allocation lead time!
    """
    return tender_nlp_service.parse_tender_text(
        tender_id=tender_id,
        tender_title=tender_title,
        scope_description=scope_description,
        tender_value_cr=tender_value_cr,
        district_code=district_code,
        district_name=district_name,
        portal_source=portal_source
    )


@router.get("/pipeline", response_model=List[TenderAnalysisResult])
def get_national_tender_pipeline():
    """Returns active national pipeline of sanctioned infrastructure projects queried directly from SQL."""
    pipeline = tender_nlp_service.get_persisted_pipeline()
    if not pipeline:
        # Fallback to sample parsing if table empty
        return [
            tender_nlp_service.parse_tender_text(
                tender_id="GEM/2026/SOLAR/99",
                tender_title="200MW Solar Photovoltaic Grid-Connected Park",
                scope_description="Turnkey engineering, mounting of mono-PERC solar modules, string inverters",
                tender_value_cr=350.0,
                district_code="MH_NAGPUR",
                district_name="Nagpur",
                portal_source="GeM"
            )
        ]
    return pipeline

