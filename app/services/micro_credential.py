from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class LegoBlockModule(BaseModel):
    module_code: str
    module_title: str
    training_duration_hours: int
    nsqf_level: int
    core_competencies_taught: List[str]
    lab_kit_required: str
    per_candidate_training_cost_inr: float


class LegoPivotPlan(BaseModel):
    source_oversupplied_nco: str
    source_trade_title: str
    target_shortage_nco: str
    target_trade_title: str
    district_code: str
    district_name: str
    surplus_trainees_available: int
    lego_block_micro_credential: LegoBlockModule
    estimated_training_weeks: int
    infrastructure_preservation_ratio_pct: float  # e.g., 85% of existing lab equipment reused!
    total_pivot_budget_lakhs: float
    planner_advisory: str


LEGO_BLOCK_REGISTRY: Dict[Tuple_Key := str, Dict[str, Any]] = {
    # Traditional Electrician (7411) -> EV Charging Station Installer
    "7411.0100->7411.0300": {
        "module_code": "LEGO-EVSE-40H",
        "module_title": "Commercial EV Fast-Charging Station (EVSE) Installation & Commissioning",
        "duration_hours": 40,
        "nsqf_level": 4,
        "competencies": [
            "120kW DC Fast-Charger High-Current Termination",
            "OCPP (Open Charge Point Protocol) Network Integration",
            "Type-2 & CCS-2 Connector Interlock Diagnostics",
            "Dual-Earth Pit Resistance Testing (< 1 Ohm)"
        ],
        "lab_kit": "1x 30kW DC Fast-Charger Demo Sim Bench with Vehicle Emulation Unit",
        "cost_per_trainee_inr": 4800.0,
        "infra_reuse_pct": 88.0
    },

    # Diesel Mechanic (7231.0100) -> EV Powertrain & Battery Tech (7231.0200)
    "7231.0100->7231.0200": {
        "module_code": "LEGO-EVBATT-45H",
        "module_title": "Automotive Lithium Battery Pack Testing, BMS & Thermal Systems",
        "duration_hours": 45,
        "nsqf_level": 4,
        "competencies": [
            "High-Voltage (400V) Manual Disconnect Safety Procedures",
            "BMS CAN-bus Fault Code Telemetry Triage",
            "Liquid Cooling Loop Glycol Bleeding & Pressurization",
            "Cell Voltage Imbalance Balancing & Replacement"
        ],
        "lab_kit": "1x 48V/72V Modular LiFePO4 Diagnostic Trainer with CAN Interface",
        "cost_per_trainee_inr": 5400.0,
        "infra_reuse_pct": 82.0
    },

    # Basic DEO / Typist (4132.0100) -> AI Data Annotation & Prompt Specialist
    "4132.0100->3511.0200": {
        "module_code": "LEGO-AIDATA-35H",
        "module_title": "Computer Vision & NLP AI Data Annotation and Prompt QA",
        "duration_hours": 35,
        "nsqf_level": 4,
        "competencies": [
            "Bounding Box & Semantic Segmentation Annotation Tooling",
            "Multilingual Audio Transcription & Speaker Diarization",
            "LLM Prompt-Response Quality Grading & Bias Tagging",
            "Data Security & Anonymization Guidelines"
        ],
        "lab_kit": "Standard Multi-core PC Lab with Web Annotation Platform Access",
        "cost_per_trainee_inr": 3200.0,
        "infra_reuse_pct": 95.0
    }
}


class LegoMicroCredentialService:
    """
    'Lego-Block' Micro-Credential Pivot Recommendation Engine (Feature 3).
    When chronic oversupply is detected, avoids shutting down centers;
    instead stacks modular 30-45 hour NSQF micro-credentials to pivot surplus trainees
    to high-demand trades while reusing 80-95% of existing center infrastructure.
    """

    def generate_pivot_recommendation(
        self,
        source_nco: str,
        target_nco: str,
        district_code: str,
        district_name: str,
        surplus_trainees: int = 500
    ) -> LegoPivotPlan:
        lookup_key = f"{source_nco}->{target_nco}"
        lego = LEGO_BLOCK_REGISTRY.get(lookup_key)

        if not lego:
            # Fallback general modular micro-credential
            lego = {
                "module_code": f"LEGO-MOD-{source_nco[:4]}",
                "module_title": "Emerging Technology Transition Micro-Credential",
                "duration_hours": 40,
                "nsqf_level": 4,
                "competencies": ["Modern Digital Tools", "Safety Protocols", "Automated Machinery Interface"],
                "lab_kit": "Modular Upgrade Kit for Existing ITI Trade Lab",
                "cost_per_trainee_inr": 4500.0,
                "infra_reuse_pct": 85.0
            }

        module = LegoBlockModule(
            module_code=lego["module_code"],
            module_title=lego["module_title"],
            training_duration_hours=lego["duration_hours"],
            nsqf_level=lego["nsqf_level"],
            core_competencies_taught=lego["competencies"],
            lab_kit_required=lego["lab_kit"],
            per_candidate_training_cost_inr=lego["cost_per_trainee_inr"]
        )

        total_cost_lakhs = round((surplus_trainees * lego["cost_per_trainee_inr"]) / 1e5, 2)
        weeks = max(3, lego["duration_hours"] // 12)

        advisory = (
            f"INFRASTRUCTURE PRESERVATION ADVISORY: Rather than defunding the {surplus_trainees} surplus seats in {district_name}, "
            f"deploy the {lego['module_title']} ({lego['duration_hours']} Hours) micro-credential to existing ITI centers. "
            f"Reuses {lego['infra_reuse_pct']}% of existing electrical/mechanical equipment, transitions {surplus_trainees} youth in {weeks} weeks, "
            f"at an economical outlay of ₹{total_cost_lakhs} Lakhs (₹{lego['cost_per_trainee_inr']:,.0f}/candidate)."
        )

        return LegoPivotPlan(
            source_oversupplied_nco=source_nco,
            source_trade_title="Oversupplied Base Trade",
            target_shortage_nco=target_nco,
            target_trade_title="High-Deficit Emerging Trade",
            district_code=district_code,
            district_name=district_name,
            surplus_trainees_available=surplus_trainees,
            lego_block_micro_credential=module,
            estimated_training_weeks=weeks,
            infrastructure_preservation_ratio_pct=lego["infra_reuse_pct"],
            total_pivot_budget_lakhs=total_cost_lakhs,
            planner_advisory=advisory
        )


lego_micro_service = LegoMicroCredentialService()
