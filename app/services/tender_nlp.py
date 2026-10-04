import re
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.innovations import GovernmentTenderRecord, TenderBoQItem
from app.models.taxonomy import NCOOccupation


class BillOfQualificationsItem(BaseModel):
    nco_code: str
    trade_title: str
    nsqf_level: int
    estimated_headcount_required: int
    deployment_phase_months: str
    critical_skills_required: List[str]


class TenderAnalysisResult(BaseModel):
    tender_id: str
    portal_source: str  # "GeM" or "CPPP"
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


TENDER_CATEGORY_TRANSLATION_RULES = {
    "solar": {
        "work_category": "Solar & Renewable Infrastructure",
        "workforce_ratio_per_cr": 2.8,
        "trades": [
            {
                "nco_code": "7411.0100",
                "title": "Solar PV Rooftop Installer & Grid Technician",
                "nsqf_level": 4,
                "share": 0.65,
                "phase": "Months 2-8 of Project",
                "skills": ["Solar PV Array Mounting", "String Inverter Setup", "Earthing & Lightning Arrestors"]
            },
            {
                "nco_code": "7411.0200",
                "title": "Industrial High-Tension (HT) Substation Electrician",
                "nsqf_level": 5,
                "share": 0.35,
                "phase": "Months 4-10 of Project",
                "skills": ["33kV Transformer Bay Termination", "Busbar Alignment", "Relay Testing"]
            }
        ]
    },
    "highway": {
        "work_category": "Expressway & Civil Highway Infrastructure",
        "workforce_ratio_per_cr": 3.4,
        "trades": [
            {
                "nco_code": "8342.0100",
                "title": "Heavy Earthmoving Machinery (JCB/Excavator) Operator",
                "nsqf_level": 4,
                "share": 0.40,
                "phase": "Months 1-6 (Earthwork & Grading)",
                "skills": ["Hydraulic Excavator Operation", "Trench Grading", "Pre-start Telemetry Diagnostics"]
            },
            {
                "nco_code": "7212.0100",
                "title": "Structural Bridge & Rebar Welder (MIG/TIG)",
                "nsqf_level": 4,
                "share": 0.35,
                "phase": "Months 3-12 (Piers & Culverts)",
                "skills": ["Rebar Cage Arc Welding", "TMT Joint Beveling", "Radiographic Inspection Prep"]
            },
            {
                "nco_code": "3112.0100",
                "title": "Total Station Road Surveyor & Topographer",
                "nsqf_level": 5,
                "share": 0.25,
                "phase": "Months 1-4 (Alignment & Elevation)",
                "skills": ["Total Station Theodolite Operation", "GPS Benchmarking", "AutoCAD Civil 3D"]
            }
        ]
    },
    "ev": {
        "work_category": "Electric Mobility & Charging Depot Infrastructure",
        "workforce_ratio_per_cr": 2.5,
        "trades": [
            {
                "nco_code": "7231.0200",
                "title": "Electric Vehicle (EV) Powertrain & Battery Technician",
                "nsqf_level": 4,
                "share": 0.60,
                "phase": "Months 3-9 (Depot Commissioning)",
                "skills": ["High Voltage Bus Wiring", "BMS Firmware Flashing", "Thermal Cooling Line Servicing"]
            },
            {
                "nco_code": "7411.0300",
                "title": "Commercial CCS-2 EV Fast-Charger Commissioning Tech",
                "nsqf_level": 4,
                "share": 0.40,
                "phase": "Months 4-8 (Grid Energization)",
                "skills": ["120kW DC Fast Charger Installation", "OCPP Protocol Setup", "AC/DC Residual Current Detection"]
            }
        ]
    },
    "healthcare": {
        "work_category": "Hospital & Critical Care Emergency Augmentation",
        "workforce_ratio_per_cr": 4.1,
        "trades": [
            {
                "nco_code": "3258.0100",
                "title": "Emergency Medical Technician (EMT - Advanced)",
                "nsqf_level": 4,
                "share": 0.55,
                "phase": "Months 6-12 (Commissioning & Operations)",
                "skills": ["Trauma Life Support", "ECG Telemetry", "Emergency Transport Care"]
            },
            {
                "nco_code": "3211.0200",
                "title": "Dialysis Clinical Technician",
                "nsqf_level": 4,
                "share": 0.45,
                "phase": "Months 8-14 (Renal Care Wing Deployment)",
                "skills": ["Dialyzer Priming", "Vascular Access", "RO Water Treatment Testing"]
            }
        ]
    }
}


class TenderNLPParserService:
    """
    Forward-Predictive NLP Engine for Government Procurement Tenders (GeM / CPPP).
    Extracts project specifications months before execution, translates them into a
    structured 'Bill of Qualifications' (BoQ), and persists the tender records to SQL.
    """

    def parse_tender_text(
        self,
        tender_id: str,
        tender_title: str,
        scope_description: str,
        tender_value_cr: float,
        district_code: str,
        district_name: str,
        portal_source: str = "GeM",
        issuing_authority: str = "National Highways Authority of India (NHAI)"
    ) -> TenderAnalysisResult:
        full_text = f"{tender_title} {scope_description}"
        
        try:
            import spacy
            nlp = spacy.load("en_core_web_sm")
            doc = nlp(full_text)
            
            # Use spaCy lemmatization for robust category extraction
            lemmas = [token.lemma_.lower() for token in doc if not token.is_stop and not token.is_punct]
            
            solar_score = len(set(lemmas).intersection({"solar", "photovoltaic", "rooftop", "renewable", "inverter"}))
            ev_score = len(set(lemmas).intersection({"ev", "electric", "vehicle", "charge", "depot", "battery"}))
            health_score = len(set(lemmas).intersection({"hospital", "medical", "dialysis", "trauma", "clinical", "health"}))
            highway_score = len(set(lemmas).intersection({"highway", "road", "bridge", "flyover", "expressway", "paving"}))
            
            scores = {"solar": solar_score, "ev": ev_score, "healthcare": health_score, "highway": highway_score}
            matched_cat = max(scores, key=scores.get) if any(scores.values()) else "highway"
            
        except Exception as e:
            # Fallback to simple matching if spaCy is unavailable
            matched_cat = "highway"
            full_text_lower = full_text.lower()
            if any(w in full_text_lower for w in ["solar", "photovoltaic", "pv rooftop", "renewable", "inverter"]):
                matched_cat = "solar"
            elif any(w in full_text_lower for w in ["ev", "electric vehicle", "charging station", "depot", "battery"]):
                matched_cat = "ev"
            elif any(w in full_text_lower for w in ["hospital", "medical", "dialysis", "trauma", "clinical", "health"]):
                matched_cat = "healthcare"
            elif any(w in full_text_lower for w in ["highway", "road", "bridge", "flyover", "expressway", "paving"]):
                matched_cat = "highway"

        rule = TENDER_CATEGORY_TRANSLATION_RULES[matched_cat]
        total_workers = int(round(tender_value_cr * rule["workforce_ratio_per_cr"]))
        total_workers = max(total_workers, 40)

        boq_items: List[BillOfQualificationsItem] = []
        for t in rule["trades"]:
            count = int(round(total_workers * t["share"]))
            boq_items.append(
                BillOfQualificationsItem(
                    nco_code=t["nco_code"],
                    trade_title=t["title"],
                    nsqf_level=t["nsqf_level"],
                    estimated_headcount_required=count,
                    deployment_phase_months=t["phase"],
                    critical_skills_required=t["skills"]
                )
            )

        lead_time = 8  # 8 months average lead time before mobilization

        advisory = (
            f"LEAD-TIME EARLY ACTION ADVISORY: Approved tender '{tender_title}' (Value: ₹{tender_value_cr:.1f} Cr) in {district_name} "
            f"will require {total_workers} certified technicians in {lead_time} months. "
            f"MSDE has an 8-month proactive window to sanction {boq_items[0].estimated_headcount_required} training seats "
            f"for {boq_items[0].trade_title} across local ITIs and PMKK centers to ensure zero contractor labor deficit."
        )

        # Persist to SQL Database
        db: Session = SessionLocal()
        try:
            existing = db.query(GovernmentTenderRecord).filter(GovernmentTenderRecord.tender_id == tender_id).first()
            if not existing:
                t_rec = GovernmentTenderRecord(
                    tender_id=tender_id,
                    portal_source=portal_source,
                    tender_title=tender_title,
                    issuing_authority=issuing_authority,
                    district_code=district_code,
                    tender_value_cr=tender_value_cr,
                    work_category=rule["work_category"],
                    raw_scope_text=scope_description,
                    project_commencement_date="2026-10-15",
                    lead_time_months=lead_time,
                    total_projected_workforce=total_workers,
                    created_at=datetime.now()
                )
                db.add(t_rec)
                db.flush()

                for b in boq_items:
                    b_rec = TenderBoQItem(
                        tender_id=tender_id,
                        nco_code=b.nco_code,
                        trade_title=b.trade_title,
                        nsqf_level=b.nsqf_level,
                        headcount_required=b.estimated_headcount_required,
                        deployment_phase=b.deployment_phase_months,
                        critical_skills_json=json.dumps(b.critical_skills_required)
                    )
                    db.add(b_rec)
                db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()

        return TenderAnalysisResult(
            tender_id=tender_id,
            portal_source=portal_source,
            tender_title=tender_title,
            issuing_authority=issuing_authority,
            district_code=district_code,
            district_name=district_name,
            estimated_value_inr_cr=tender_value_cr,
            work_category=rule["work_category"],
            project_commencement_date="2026-10-15",
            lead_time_months_before_hiring=lead_time,
            total_projected_workforce=total_workers,
            bill_of_qualifications=boq_items,
            msde_proactive_action_advisory=advisory
        )

    def get_persisted_pipeline(self) -> List[TenderAnalysisResult]:
        """Queries the persistent SQL database of sanctioned tenders with BoQ breakdowns."""
        db: Session = SessionLocal()
        results: List[TenderAnalysisResult] = []
        try:
            records = db.query(GovernmentTenderRecord).all()
            for r in records:
                boq_list = []
                for b in r.boq_items:
                    skills = json.loads(b.critical_skills_json) if b.critical_skills_json.startswith("[") else [b.critical_skills_json]
                    boq_list.append(
                        BillOfQualificationsItem(
                            nco_code=b.nco_code,
                            trade_title=b.trade_title,
                            nsqf_level=b.nsqf_level,
                            estimated_headcount_required=b.headcount_required,
                            deployment_phase_months=b.deployment_phase,
                            critical_skills_required=skills
                        )
                    )

                adv = (
                    f"LEAD-TIME EARLY ACTION ADVISORY: Approved tender '{r.tender_title}' (Value: ₹{r.tender_value_cr:.1f} Cr) in {r.district_code} "
                    f"requires {r.total_projected_workforce} certified technicians in {r.lead_time_months} months."
                )

                results.append(
                    TenderAnalysisResult(
                        tender_id=r.tender_id,
                        portal_source=r.portal_source,
                        tender_title=r.tender_title,
                        issuing_authority=r.issuing_authority,
                        district_code=r.district_code,
                        district_name=r.district_code.split("_")[-1].capitalize(),
                        estimated_value_inr_cr=r.tender_value_cr,
                        work_category=r.work_category,
                        project_commencement_date=r.project_commencement_date,
                        lead_time_months_before_hiring=r.lead_time_months,
                        total_projected_workforce=r.total_projected_workforce,
                        bill_of_qualifications=boq_list,
                        msde_proactive_action_advisory=adv
                    )
                )
        finally:
            db.close()
        return results


tender_nlp_service = TenderNLPParserService()
