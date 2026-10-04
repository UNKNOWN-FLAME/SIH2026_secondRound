import json
import random
import numpy as np
from datetime import datetime
from sqlalchemy.orm import Session

from app.core.database import Base, engine, SessionLocal
from app.models.geography import State, District
from app.models.taxonomy import Sector, NCOOccupation
from app.models.demand import JobPostingSignal, IndustrialCapexSignal, LaborMigrationSignal, CompositeDemandRecord
from app.models.supply import TrainingCenter, TradeCapacity, TradePassoutMetric
from app.models.policy import SkillAdjacencyEdge
from app.seed.official_taxonomies import (
    OFFICIAL_STATES,
    OFFICIAL_DISTRICTS,
    OFFICIAL_SECTORS,
    OFFICIAL_NCO_OCCUPATIONS,
    REAL_INDUSTRIAL_CAPEX_PROJECTS
)
from app.services.cdi_engine import cdi_engine
from app.services.supply_engine import supply_engine
from app.services.nco_matcher import nco_matcher_service
from app.services.skill_graph_engine import skill_graph_engine


def seed_database(db: Session = None):
    should_close = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        should_close = True

    print(">>> Initializing LMIS Database Seeding...")

    # 1. Seed States
    for st_data in OFFICIAL_STATES:
        existing = db.query(State).filter(State.code == st_data["code"]).first()
        if not existing:
            st = State(code=st_data["code"], name=st_data["name"], capital=st_data["capital"])
            db.add(st)
    db.commit()

    # 2. Seed Districts
    for d_data in OFFICIAL_DISTRICTS:
        existing = db.query(District).filter(District.code == d_data["code"]).first()
        if not existing:
            d = District(
                code=d_data["code"],
                lgd_code=d_data["lgd_code"],
                name=d_data["name"],
                state_code=d_data["state_code"],
                tier=d_data["tier"],
                latitude=d_data["latitude"],
                longitude=d_data["longitude"],
                industrial_focus=d_data["industrial_focus"]
            )
            db.add(d)
    db.commit()

    # 3. Seed Sectors
    for s_data in OFFICIAL_SECTORS:
        existing = db.query(Sector).filter(Sector.code == s_data["code"]).first()
        if not existing:
            s = Sector(
                code=s_data["code"],
                name=s_data["name"],
                description=s_data["description"],
                annual_growth_rate_pct=s_data["annual_growth_rate_pct"],
                ssc_name=s_data["ssc_name"]
            )
            db.add(s)
    db.commit()

    # 4. Seed NCO Occupations
    for o_data in OFFICIAL_NCO_OCCUPATIONS:
        existing = db.query(NCOOccupation).filter(NCOOccupation.nco_code == o_data["nco_code"]).first()
        if not existing:
            occ = NCOOccupation(
                nco_code=o_data["nco_code"],
                division=o_data["division"],
                sub_division=o_data["sub_division"],
                group_code=o_data["group_code"],
                title=o_data["title"],
                sector_code=o_data["sector_code"],
                nsqf_level=o_data["nsqf_level"],
                description=o_data["description"],
                typical_roles=o_data.get("typical_roles"),
                core_skills=json.dumps(o_data["core_skills"]),
                is_emerging=o_data["is_emerging"],
                is_legacy_at_risk=o_data["is_legacy_at_risk"]
            )
            db.add(occ)
    db.commit()

    # 5. Seed Industrial Capex Projects
    for c_data in REAL_INDUSTRIAL_CAPEX_PROJECTS:
        existing = db.query(IndustrialCapexSignal).filter(IndustrialCapexSignal.project_name == c_data["project_name"]).first()
        if not existing:
            c = IndustrialCapexSignal(
                project_name=c_data["project_name"],
                district_code=c_data["district_code"],
                sector_code=c_data["sector_code"],
                primary_nco_code=c_data["primary_nco_code"],
                investment_inr_cr=c_data["investment_inr_cr"],
                announcement_period=c_data["announcement_period"],
                gestation_period_months=c_data["gestation_period_months"],
                expected_direct_jobs=c_data["expected_direct_jobs"],
                status=c_data["status"],
                scheme_ref=c_data.get("scheme_ref")
            )
            db.add(c)
    db.commit()

    # 6. Seed Training Centers per District
    centers = []
    districts = db.query(District).all()
    for d in districts:
        c1 = TrainingCenter(
            center_code=f"ITI_GOVT_{d.code}",
            name=f"Government Industrial Training Institute (ITI) {d.name}",
            district_code=d.code,
            center_type="ITI_GOVT",
            is_active=1,
            latitude=d.latitude + 0.015,
            longitude=d.longitude + 0.012
        )
        c2 = TrainingCenter(
            center_code=f"PMKVY_TC_{d.code}",
            name=f"Pradhan Mantri Kaushal Kendra (PMKK) {d.name}",
            district_code=d.code,
            center_type="PMKVY_TC",
            is_active=1,
            latitude=d.latitude - 0.012,
            longitude=d.longitude - 0.018
        )
        for c in [c1, c2]:
            ex = db.query(TrainingCenter).filter(TrainingCenter.center_code == c.center_code).first()
            if not ex:
                db.add(c)
                centers.append(c)
    db.commit()

    # 7. Generate 24-Month Calibrated Historical Time Series (2024-04 to 2026-03)
    months = []
    for y in [2024, 2025, 2026]:
        for m in range(1, 13):
            if y == 2024 and m < 4:
                continue
            if y == 2026 and m > 3:
                continue
            months.append(f"{y}-{m:02d}")

    # Check if historical postings exist
    has_history = db.query(JobPostingSignal).first() is not None

    if not has_history:
        print(f">>> Generating 24-month calibrated historical series across {len(districts)} districts and {len(OFFICIAL_NCO_OCCUPATIONS)} trades...")
        random.seed(42)
        np.random.seed(42)

        for d in districts:
            for occ in OFFICIAL_NCO_OCCUPATIONS:
                nco = occ["nco_code"]
                is_emerging = occ["is_emerging"]
                is_legacy = occ["is_legacy_at_risk"]

                # Base parameters
                if is_emerging:
                    # High demand, fast-growing postings, higher wages, limited supply
                    base_postings = random.randint(180, 320)
                    growth_rate = 0.022  # ~28% annual growth
                    base_wage = 24000.0
                    base_seats = random.randint(40, 80)
                    base_enrolled = int(base_seats * 0.90)
                elif is_legacy:
                    # Stagnant/declining demand, stagnant wages, high historic seats (chronic surplus)
                    base_postings = random.randint(40, 90)
                    growth_rate = -0.008 # -9% annual decline
                    base_wage = 14500.0
                    base_seats = random.randint(160, 280)
                    base_enrolled = int(base_seats * 0.85)
                else:
                    base_postings = random.randint(110, 160)
                    growth_rate = 0.008
                    base_wage = 18500.0
                    base_seats = random.randint(90, 140)
                    base_enrolled = int(base_seats * 0.88)

                # Check if district has a Capex project matching this trade
                capex_for_trade = next(
                    (cp for cp in REAL_INDUSTRIAL_CAPEX_PROJECTS if cp["district_code"] == d.code and cp["primary_nco_code"] == nco),
                    None
                )
                capex_cr = capex_for_trade["investment_inr_cr"] if capex_for_trade else 0.0
                capex_direct_jobs = capex_for_trade["expected_direct_jobs"] if capex_for_trade else 0

                for idx, period in enumerate(months):
                    noise = np.random.normal(1.0, 0.06)
                    seasonal = 1.10 if period.endswith(("-01", "-02", "-09", "-10")) else 0.95
                    
                    cur_postings = int(max(15, round(base_postings * ((1 + growth_rate) ** idx) * noise * seasonal)))
                    velocity = round(min(2.8, max(0.8, 1.2 + (0.8 if is_emerging else -0.3) + np.random.normal(0, 0.1))), 2)
                    cur_wage = round(base_wage * ((1 + 0.005) ** idx) + random.randint(-400, 400), 2)
                    
                    # 1. Job Posting Signal
                    post_sig = JobPostingSignal(
                        district_code=d.code,
                        nco_code=nco,
                        period=period,
                        active_postings=cur_postings,
                        hiring_velocity_score=velocity,
                        median_wage_inr=cur_wage,
                        source="NCS & State Labour Exchange"
                    )
                    db.add(post_sig)

                    # 2. Labor Migration Signal (e-Shram)
                    eshram_seekers = random.randint(80, 220) if is_legacy else random.randint(20, 60)
                    inflow = random.randint(40, 120) if is_emerging else random.randint(10, 30)
                    mig_sig = LaborMigrationSignal(
                        district_code=d.code,
                        nco_code=nco,
                        period=period,
                        eshram_active_seekers=eshram_seekers,
                        outbound_mobility_ratio=0.28 if is_legacy else 0.12,
                        inbound_labor_inflow=inflow
                    )
                    db.add(mig_sig)

                    # 3. Calculate CDI
                    cdi_calc = cdi_engine.calculate_cdi(
                        active_postings=cur_postings,
                        capex_inr_cr=capex_cr,
                        expected_direct_jobs=capex_direct_jobs,
                        hiring_velocity=velocity,
                        median_wage_inr=cur_wage,
                        inbound_migration_flow=inflow
                    )

                    cdi_rec = CompositeDemandRecord(
                        district_code=d.code,
                        nco_code=nco,
                        period=period,
                        posting_component=cdi_calc["posting_component"],
                        capex_component=cdi_calc["capex_component"],
                        velocity_component=cdi_calc["velocity_component"],
                        wage_component=cdi_calc["wage_component"],
                        migration_component=cdi_calc["migration_component"],
                        cdi_score=cdi_calc["cdi_score"],
                        projected_headcount_demand=cdi_calc["projected_headcount_demand"]
                    )
                    db.add(cdi_rec)

                    # 4. Supply calculation
                    cur_seats = int(base_seats * (1.0 + (0.01 * (idx // 12))))
                    cur_enrolled = int(base_enrolled * (1.0 + (0.01 * (idx // 12))))
                    sup_calc = supply_engine.calculate_effective_supply(
                        sanctioned_seats=cur_seats,
                        enrolled_trainees=cur_enrolled,
                        pass_completion_rate=0.79,
                        local_retention_rate=0.42,
                        interdistrict_migration_rate=0.26,
                        eshram_active_seekers=eshram_seekers
                    )

                    passout_metric = TradePassoutMetric(
                        district_code=d.code,
                        nco_code=nco,
                        period=period,
                        annual_seat_capacity=sup_calc["annual_seat_capacity"],
                        certified_passouts=sup_calc["certified_passouts"],
                        pass_completion_rate=sup_calc["pass_completion_rate"],
                        local_placement_absorption_rate=sup_calc["local_placement_absorption_rate"],
                        interdistrict_migration_rate=sup_calc["interdistrict_migration_rate"],
                        unorganized_eshram_pool=sup_calc["unorganized_eshram_pool"],
                        effective_local_supply=sup_calc["effective_local_supply"]
                    )
                    db.add(passout_metric)

        db.commit()

    # 8. Seed Pre-configured Skill Adjacency Edges for Bridge Courses
    bridge_edges = [
        {
            "source": "7231.0100",  # Diesel Mechanic
            "target": "7231.0200",  # EV Powertrain & Battery Tech
            "overlap_pct": 72.5,
            "shared": ["12V Automotive Electricals", "Radiator & Hydraulic Cooling", "Brake & Suspension Alignment", "Workshop Safety Norms"],
            "gap": ["High Voltage Battery Pack Assembly", "BMS Telemetry Diagnostics", "CAN-bus Protocol", "Electric Traction Motors"],
            "bridge_weeks": 6,
            "nsqf": 4
        },
        {
            "source": "8212.0300",  # Manual Soldering
            "target": "7421.0300",  # SMT Machine Operator
            "overlap_pct": 68.0,
            "shared": ["Component Identification (Resistors/Capacitors)", "Basic Soldering Metallurgy", "Visual Joint Inspection", "ESD Safety"],
            "gap": ["Pick & Place Machine Programming", "Solder Paste Stencil Printing", "Reflow Oven Thermal Profiling", "AOI Automated Inspection"],
            "bridge_weeks": 6,
            "nsqf": 4
        },
        {
            "source": "5321.0100",  # Ward Attendant
            "target": "3258.0100",  # Emergency Medical Tech (EMT)
            "overlap_pct": 54.0,
            "shared": ["Patient Stretcher Transfer", "Vital Signs Observation", "Hospital Sanitation Norms", "First Aid Basics"],
            "gap": ["Advanced Life Support (BLS/ACLS)", "Airway Management", "Defibrillator Operation", "Emergency Triage Assessment"],
            "bridge_weeks": 8,
            "nsqf": 4
        },
        {
            "source": "4132.0100",  # Basic Data Entry Operator
            "target": "3511.0100",  # Cloud Infrastructure Associate
            "overlap_pct": 52.0,
            "shared": ["Computer Hardware Peripherals", "Spreadsheet Logging", "Data Entry Accuracy", "Operating System Basics"],
            "gap": ["Linux CLI Administration", "Server Rack Cabling", "Virtual Machine Provisioning", "Data Center Telemetry"],
            "bridge_weeks": 8,
            "nsqf": 5
        }
    ]

    for b in bridge_edges:
        ex = db.query(SkillAdjacencyEdge).filter(
            SkillAdjacencyEdge.source_nco_code == b["source"],
            SkillAdjacencyEdge.target_nco_code == b["target"]
        ).first()
        if not ex:
            edge = SkillAdjacencyEdge(
                source_nco_code=b["source"],
                target_nco_code=b["target"],
                skill_overlap_pct=b["overlap_pct"],
                skill_distance=round(1.0 - (b["overlap_pct"] / 100.0), 3),
                shared_skills_json=json.dumps(b["shared"]),
                gap_skills_json=json.dumps(b["gap"]),
                recommended_bridge_weeks=b["bridge_weeks"],
                target_nsqf_level=b["nsqf"],
                feasibility_score=0.88
            )
            db.add(edge)
    db.commit()

    # 9. Seed High-Impact Innovations (Tenders, Material Inflows, Candidates, Corridors, Gati-Shakti, Obsolescence, CSR)
    from app.seed.innovations_seeder import seed_innovations_data
    seed_innovations_data(db)

    # 10. Initialize Semantic Matcher & Skill Graph Services in Memory
    all_occs = db.query(NCOOccupation).all()
    nco_matcher_service.build_index(all_occs)
    
    occ_data_list = [
        {
            "nco_code": o.nco_code,
            "title": o.title,
            "sector_code": o.sector_code,
            "nsqf_level": o.nsqf_level,
            "core_skills": o.core_skills,
            "is_emerging": o.is_emerging,
            "is_legacy_at_risk": o.is_legacy_at_risk
        }
        for o in all_occs
    ]
    skill_graph_engine.load_taxonomy(occ_data_list)

    print(">>> LMIS Database Seeding Completed Successfully!")
    if should_close:
        db.close()



if __name__ == "__main__":
    seed_database()
