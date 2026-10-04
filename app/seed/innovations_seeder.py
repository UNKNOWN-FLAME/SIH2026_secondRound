import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.innovations import (
    GovernmentTenderRecord,
    TenderBoQItem,
    DistrictMaterialInflow,
    VerifiedArtisanCandidate,
    RailwayTransitCorridorRecord,
    GatiShaktiProjectNode,
    SkillObsolescenceMetric,
    CSRCorporateGrant
)


def seed_innovations_data(db: Session):
    print(">>> Seeding Persistent Innovation Databases (Tenders, Material Inflows, Verified Artisans, Corridors, Gati-Shakti, Obsolescence, CSR)...")

    # 1. Seed Verified Artisan Candidates (for Real WhatsApp Matchmaking & e-Shram Spatial Radar)
    if db.query(VerifiedArtisanCandidate).count() == 0:
        candidates = [
            # Pune (MH_PUNE)
            {
                "uid": "MSDE-PUN-2025-0182",
                "name": "Rohan Suresh Patil",
                "phone": "+91 98221 44102",
                "district": "MH_PUNE",
                "nco": "7231.0200",
                "nsqf": 4,
                "institute": "Government ITI Aundh, Pune",
                "lat": 18.5580,
                "lon": 73.8075
            },
            {
                "uid": "MSDE-PUN-2025-0449",
                "name": "Amit Vilas Shinde",
                "phone": "+91 98904 11893",
                "district": "MH_PUNE",
                "nco": "7231.0200",
                "nsqf": 4,
                "institute": "PMKK Skill Kendra Pune Central",
                "lat": 18.5204,
                "lon": 73.8567
            },
            {
                "uid": "MSDE-PUN-2025-0891",
                "name": "Siddharth Gautam Kamble",
                "phone": "+91 97631 88401",
                "district": "MH_PUNE",
                "nco": "7411.0100",
                "nsqf": 4,
                "institute": "Government ITI Khed (Chakan)",
                "lat": 18.7291,
                "lon": 73.6738
            },
            {
                "uid": "MSDE-PUN-2025-1024",
                "name": "Pooja Ramesh Deshmukh",
                "phone": "+91 94220 55912",
                "district": "MH_PUNE",
                "nco": "7421.0300",
                "nsqf": 4,
                "institute": "Government ITI Bhosari MIDC",
                "lat": 18.6298,
                "lon": 73.8431
            },
            {
                "uid": "MSDE-PUN-2025-1150",
                "name": "Vikram Arjun Jadhav",
                "phone": "+91 98229 33719",
                "district": "MH_PUNE",
                "nco": "8343.0100",
                "nsqf": 4,
                "institute": "PMKK Logistics Kendra Talegaon",
                "lat": 18.7345,
                "lon": 73.6821
            },

            # Kanpur (UP_KANPUR)
            {
                "uid": "MSDE-KAN-2025-0312",
                "name": "Mohammad Irfan Ansari",
                "phone": "+91 94152 77481",
                "district": "UP_KANPUR",
                "nco": "7411.0100",
                "nsqf": 4,
                "institute": "Government ITI Pandu Nagar, Kanpur",
                "lat": 26.4718,
                "lon": 80.3129
            },
            {
                "uid": "MSDE-KAN-2025-0554",
                "name": "Vikram Singh Yadav",
                "phone": "+91 94501 33290",
                "district": "UP_KANPUR",
                "nco": "7212.0100",
                "nsqf": 4,
                "institute": "Govt ITI Lal Bangla, Kanpur",
                "lat": 26.4380,
                "lon": 80.3920
            },
            {
                "uid": "MSDE-KAN-2025-0810",
                "name": "Pankaj Kumar Shukla",
                "phone": "+91 93361 22804",
                "district": "UP_KANPUR",
                "nco": "7231.0100",
                "nsqf": 4,
                "institute": "Government ITI Ghatampur",
                "lat": 26.1582,
                "lon": 80.1691
            },
            {
                "uid": "MSDE-KAN-2025-0941",
                "name": "Anil Kumar Maurya",
                "phone": "+91 94518 99120",
                "district": "UP_KANPUR",
                "nco": "8343.0100",
                "nsqf": 4,
                "institute": "Government ITI Ruma Freight Feeder",
                "lat": 26.3980,
                "lon": 80.4420
            },

            # Ahmedabad (GJ_AHMEDABAD)
            {
                "uid": "MSDE-AHM-2025-0211",
                "name": "Hardik Jayesh Patel",
                "phone": "+91 98250 88319",
                "district": "GJ_AHMEDABAD",
                "nco": "7421.0300",
                "nsqf": 4,
                "institute": "Government ITI Sanand Auto Hub",
                "lat": 22.9868,
                "lon": 72.3787
            },
            {
                "uid": "MSDE-AHM-2025-0442",
                "name": "Jignesh Bhikhabhai Vaghela",
                "phone": "+91 98791 44203",
                "district": "GJ_AHMEDABAD",
                "nco": "7231.0200",
                "nsqf": 4,
                "institute": "Government ITI Kubernagar, Ahmedabad",
                "lat": 23.0612,
                "lon": 72.6318
            },

            # Bengaluru Urban (KA_BLR_URBAN)
            {
                "uid": "MSDE-BLR-2025-0105",
                "name": "Karthik R. Gowda",
                "phone": "+91 99801 77312",
                "district": "KA_BLR_URBAN",
                "nco": "3511.0100",
                "nsqf": 5,
                "institute": "Government ITI Hosur Road, Bengaluru",
                "lat": 12.9352,
                "lon": 77.6101
            },
            {
                "uid": "MSDE-BLR-2025-0318",
                "name": "Syed Farooq Ahmed",
                "phone": "+91 98450 66201",
                "district": "KA_BLR_URBAN",
                "nco": "7421.0300",
                "nsqf": 4,
                "institute": "PMKK Electronics Hub Peenya",
                "lat": 13.0312,
                "lon": 77.5180
            },

            # Lucknow (UP_LUCKNOW)
            {
                "uid": "MSDE-LKO-2025-0199",
                "name": "Abhishek Manoj Tiwari",
                "phone": "+91 94150 11982",
                "district": "UP_LUCKNOW",
                "nco": "3258.0100",
                "nsqf": 4,
                "institute": "Government ITI Aliganj, Lucknow",
                "lat": 26.8854,
                "lon": 80.9462
            },
            {
                "uid": "MSDE-LKO-2025-0412",
                "name": "Deepak Rajendra Sahu",
                "phone": "+91 94520 88314",
                "district": "UP_LUCKNOW",
                "nco": "3211.0200",
                "nsqf": 4,
                "institute": "State Health Skill Institute Lucknow",
                "lat": 26.8500,
                "lon": 80.9200
            },

            # Nagpur (MH_NAGPUR)
            {
                "uid": "MSDE-NAG-2025-0220",
                "name": "Pranav Vinayak Meshram",
                "phone": "+91 98230 44192",
                "district": "MH_NAGPUR",
                "nco": "7411.0100",
                "nsqf": 4,
                "institute": "Government ITI Hingna, Nagpur",
                "lat": 21.0854,
                "lon": 78.9621
            },
            {
                "uid": "MSDE-NAG-2025-0551",
                "name": "Swapnil Sanjay Raut",
                "phone": "+91 98901 77309",
                "district": "MH_NAGPUR",
                "nco": "8342.0100",
                "nsqf": 4,
                "institute": "Government ITI Sadar, Nagpur",
                "lat": 21.1610,
                "lon": 79.0812
            }
        ]

        for c in candidates:
            cand_rec = VerifiedArtisanCandidate(
                candidate_uid=c["uid"],
                full_name=c["name"],
                phone=c["phone"],
                district_code=c["district"],
                nco_code=c["nco"],
                nsqf_level=c["nsqf"],
                institution_name=c["institute"],
                latitude=c["lat"],
                longitude=c["lon"],
                verification_status="MSDE_VERIFIED_SKILL_ID",
                is_available=True
            )
            db.add(cand_rec)
        db.commit()
        print(f"   -> Seeded {len(candidates)} verified artisan candidates.")

    # 2. Seed District Material Inflows (Time-Series Commodity Proxy for 6 Districts x 24 Months)
    if db.query(DistrictMaterialInflow).count() == 0:
        districts = ["MH_PUNE", "MH_NAGPUR", "UP_KANPUR", "UP_LUCKNOW", "GJ_AHMEDABAD", "KA_BLR_URBAN"]
        commodities = [
            {
                "code": "COMM_CEMENT_TMT",
                "name": "Commercial Grade OPC Cement (50kg bags) & TMT Steel (MT)",
                "unit": "Metric Tonnes (MT)",
                "nco": "7212.0100",
                "factor": 1.45,
                "base": 4200.0
            },
            {
                "code": "COMM_EV_BATTERY_CELLS",
                "name": "LFP / NMC Prismatic Battery Cells & Inverters",
                "unit": "Pack Units",
                "nco": "7231.0200",
                "factor": 0.35,
                "base": 1250.0
            },
            {
                "code": "COMM_SOLAR_PANELS_INVERTERS",
                "name": "Mono-PERC Solar Modules & Grid Inverters",
                "unit": "kWp Installed",
                "nco": "7411.0100",
                "factor": 0.08,
                "base": 3800.0
            },
            {
                "code": "COMM_HVAC_COMPRESSORS",
                "name": "Commercial VRF & Inverter HVAC Compressors",
                "unit": "Compressor Units",
                "nco": "7127.0100",
                "factor": 0.40,
                "base": 850.0
            }
        ]

        # Generate 24 periods (2024-04 to 2026-03)
        periods = []
        for year in [2024, 2025]:
            for m in range(4 if year == 2024 else 1, 13):
                periods.append(f"{year}-{m:02d}")
        for m in range(1, 4):
            periods.append(f"2026-{m:02d}")

        inflow_count = 0
        for d in districts:
            for c in commodities:
                prev_vol = c["base"]
                for p_idx, p in enumerate(periods):
                    growth = 1.0 + (0.02 * (p_idx % 6)) + (0.015 if "PUNE" in d or "AHMEDABAD" in d else 0.008)
                    vol = round(c["base"] * growth, 1)
                    mom_pct = round(((vol - prev_vol) / prev_vol) * 100.0, 1) if p_idx > 0 else 0.0
                    derived_hc = max(int(round(vol * (c["factor"] / 10.0))), 25)

                    rec = DistrictMaterialInflow(
                        district_code=d,
                        period=p,
                        commodity_code=c["code"],
                        commodity_name=c["name"],
                        unit=c["unit"],
                        monthly_inflow_volume=vol,
                        volume_growth_mom_pct=mom_pct,
                        mapped_nco_code=c["nco"],
                        labor_intensity_factor=c["factor"],
                        derived_informal_headcount=derived_hc
                    )
                    db.add(rec)
                    prev_vol = vol
                    inflow_count += 1

        db.commit()
        print(f"   -> Seeded {inflow_count} district monthly material inflow records.")

    # 3. Seed Government Tenders (GeM & CPPP) with Bill of Qualifications (BoQ)
    if db.query(GovernmentTenderRecord).count() == 0:
        tenders_data = [
            {
                "tender_id": "GEM/2026/SOLAR/99",
                "portal": "GeM",
                "title": "200MW Solar Photovoltaic Grid-Connected Park Installation & Commissioning",
                "authority": "Solar Energy Corporation of India (SECI)",
                "district": "MH_NAGPUR",
                "val_cr": 350.0,
                "category": "Solar & Renewable Infrastructure",
                "scope": "Turnkey engineering, mounting of mono-PERC crystalline solar photovoltaic modules, string inverters, transmission line integration, 33kV high tension substation, earthing pits, and SCADA monitoring.",
                "lead": 8,
                "workers": 980,
                "boq": [
                    {
                        "nco": "7411.0100",
                        "title": "Solar PV Rooftop Installer & Grid Technician",
                        "nsqf": 4,
                        "headcount": 637,
                        "phase": "Months 2-8 of Project",
                        "skills": ["Solar Array Mounting", "String Inverter Setup", "Earthing & Lightning Arrestors"]
                    },
                    {
                        "nco": "7411.0200",
                        "title": "Industrial High-Tension (HT) Substation Electrician",
                        "nsqf": 5,
                        "headcount": 343,
                        "phase": "Months 4-10 of Project",
                        "skills": ["33kV Transformer Bay Termination", "Busbar Alignment", "Relay Calibration"]
                    }
                ]
            },
            {
                "tender_id": "CPPP/2026/EXPR/441",
                "portal": "CPPP",
                "title": "Package 4: 48km Access-Controlled Greenfield Expressway & Culverts Construction",
                "authority": "National Highways Authority of India (NHAI)",
                "district": "UP_KANPUR",
                "val_cr": 480.0,
                "category": "Expressway & Civil Highway Infrastructure",
                "scope": "Earthwork excavation, sub-grade preparation, reinforced concrete box culverts, bridge pier construction, TMT rebar bending and welding, pavement quality concrete laying, and automated telemetry toll plazas.",
                "lead": 10,
                "workers": 1632,
                "boq": [
                    {
                        "nco": "8342.0100",
                        "title": "Heavy Earthmoving Machinery (JCB/Excavator) Operator",
                        "nsqf": 4,
                        "headcount": 653,
                        "phase": "Months 1-6 (Earthwork & Sub-base)",
                        "skills": ["Hydraulic Excavator Operation", "Trench Grading", "Pre-start Telemetry Diagnostics"]
                    },
                    {
                        "nco": "7212.0100",
                        "title": "Structural Bridge & Rebar Welder (MIG/TIG)",
                        "nsqf": 4,
                        "headcount": 571,
                        "phase": "Months 3-12 (Piers & Culverts)",
                        "skills": ["Rebar Cage Arc Welding", "TMT Joint Beveling", "Radiographic Inspection Prep"]
                    },
                    {
                        "nco": "3112.0100",
                        "title": "Total Station Road Surveyor & Topographer",
                        "nsqf": 5,
                        "headcount": 408,
                        "phase": "Months 1-4 (Alignment & Elevation)",
                        "skills": ["Total Station Theodolite Operation", "GPS Benchmarking", "AutoCAD Civil 3D"]
                    }
                ]
            },
            {
                "tender_id": "GEM/2026/EVBUS/12",
                "portal": "GeM",
                "title": "Commercial Depot Charging Hub: 60x 120kW DC Fast-Charging Guns & Battery Swap",
                "authority": "Maharashtra State Road Transport Corporation (MSRTC)",
                "district": "MH_PUNE",
                "val_cr": 210.0,
                "category": "Electric Mobility & Charging Depot Infrastructure",
                "scope": "Turnkey deployment of commercial depot CCS-2 electric bus charging systems, 3.3MW dedicated industrial transformer yard, dual redundant power backup, and battery cooling telemetry diagnostics.",
                "lead": 7,
                "workers": 525,
                "boq": [
                    {
                        "nco": "7231.0200",
                        "title": "Electric Vehicle (EV) Powertrain & Battery Technician",
                        "nsqf": 4,
                        "headcount": 315,
                        "phase": "Months 3-9 (Depot Commissioning)",
                        "skills": ["High Voltage Bus Wiring", "BMS Firmware Flashing", "Thermal Cooling Line Servicing"]
                    },
                    {
                        "nco": "7411.0300",
                        "title": "Commercial CCS-2 EV Fast-Charger Commissioning Tech",
                        "nsqf": 4,
                        "headcount": 210,
                        "phase": "Months 4-8 (Grid Energization)",
                        "skills": ["120kW DC Fast Charger Installation", "OCPP Protocol Setup", "AC/DC Residual Current Detection"]
                    }
                ]
            }
        ]

        for t in tenders_data:
            tender_rec = GovernmentTenderRecord(
                tender_id=t["tender_id"],
                portal_source=t["portal"],
                tender_title=t["title"],
                issuing_authority=t["authority"],
                district_code=t["district"],
                tender_value_cr=t["val_cr"],
                work_category=t["category"],
                raw_scope_text=t["scope"],
                project_commencement_date="2026-10-15",
                lead_time_months=t["lead"],
                total_projected_workforce=t["workers"],
                created_at=datetime.utcnow()
            )
            db.add(tender_rec)
            db.flush()

            for item in t["boq"]:
                b_rec = TenderBoQItem(
                    tender_id=t["tender_id"],
                    nco_code=item["nco"],
                    trade_title=item["title"],
                    nsqf_level=item["nsqf"],
                    headcount_required=item["headcount"],
                    deployment_phase=item["phase"],
                    critical_skills_json=json.dumps(item["skills"])
                )
                db.add(b_rec)

        db.commit()
        print(f"   -> Seeded {len(tenders_data)} government procurement tenders with BoQ breakdowns.")

    # 4. Seed Railway Transit Corridors (IRCTC + e-Shram Migration Flows)
    if db.query(RailwayTransitCorridorRecord).count() == 0:
        corridors = [
            {
                "route": "Pune Junction (PUNE) -> Gorakhpur (GKP) Express Corridors",
                "orig_stn": "PUNE",
                "orig_hub": "Pune Industrial Belt (Bhosari/Chakan MIDC)",
                "orig_state": "MH",
                "orig_dist": "MH_PUNE",
                "dest_stn": "GKP",
                "dest_cluster": "Gorakhpur & Purvanchal Industrial Feeder",
                "dest_state": "UP",
                "dest_dist": "UP_GORAKHPUR",
                "week": "2026-W42",
                "outflow": 38500,
                "nco": "7231.0200",
                "artisans": 16200,
                "tag": "Festive Return (Chhath/Diwali) & Agricultural Window"
            },
            {
                "route": "Surat (ST) -> Patna / Muzaffarpur (PNBE/MFP) Textile & Diamond Corridors",
                "orig_stn": "ST",
                "orig_hub": "Surat Industrial Diamond & Textile Hub",
                "orig_state": "GJ",
                "orig_dist": "GJ_AHMEDABAD",
                "dest_stn": "PNBE",
                "dest_cluster": "Patna & North Bihar Feeder",
                "dest_state": "BR",
                "dest_dist": "BR_PATNA",
                "week": "2026-W42",
                "outflow": 46000,
                "nco": "7212.0100",
                "artisans": 21500,
                "tag": "Chhath Puja Mass Migration Corridor"
            },
            {
                "route": "Bengaluru (SBC) -> Lucknow (LKO) IT & Electronics Corridors",
                "orig_stn": "SBC",
                "orig_hub": "Bengaluru Urban Electronics Parks",
                "orig_state": "KA",
                "orig_dist": "KA_BLR_URBAN",
                "dest_stn": "LKO",
                "dest_cluster": "Lucknow / Kanpur Industrial Belt",
                "dest_state": "UP",
                "dest_dist": "UP_LUCKNOW",
                "week": "2026-W42",
                "outflow": 24000,
                "nco": "7421.0300",
                "artisans": 9800,
                "tag": "Post-Harvest Annual Rotation"
            }
        ]

        for c in corridors:
            rec = RailwayTransitCorridorRecord(
                corridor_route=c["route"],
                origin_station_code=c["orig_stn"],
                origin_hub_name=c["orig_hub"],
                origin_state_code=c["orig_state"],
                origin_district_code=c["orig_dist"],
                destination_station_code=c["dest_stn"],
                destination_cluster_name=c["dest_cluster"],
                destination_state_code=c["dest_state"],
                destination_district_code=c["dest_dist"],
                reporting_week=c["week"],
                weekly_passenger_outflow=c["outflow"],
                dominant_trade_nco=c["nco"],
                migrant_artisans_count=c["artisans"],
                transit_reason_tag=c["tag"]
            )
            db.add(rec)
        db.commit()
        print(f"   -> Seeded {len(corridors)} railway transit migration corridors.")

    # 5. Seed PM Gati-Shakti Multi-Modal Infrastructure Project Nodes
    if db.query(GatiShaktiProjectNode).count() == 0:
        gs_nodes = [
            {
                "node_id": "GS-NODE-WDFC-PUNE",
                "name": "Talegaon-Chakan Multi-Modal Logistics Hub & DFC Spur",
                "type": "Multi-Modal Logistics Park (MMLP) & Western DFC Feeder",
                "dist": "MH_PUNE",
                "state": "MH",
                "lat": 18.7291,
                "lon": 73.6738,
                "capex": 1850.0,
                "go_live": "2027-04",
                "radius": 50.0,
                "lead": 12
            },
            {
                "node_id": "GS-NODE-EDFC-KANPUR",
                "name": "Eastern Dedicated Freight Corridor (EDFC) Ruma Integrated Terminal",
                "type": "Dedicated Freight Corridor (DFC) Multi-Modal Terminal",
                "dist": "UP_KANPUR",
                "state": "UP",
                "lat": 26.3980,
                "lon": 80.4420,
                "capex": 2200.0,
                "go_live": "2027-01",
                "radius": 50.0,
                "lead": 10
            },
            {
                "node_id": "GS-NODE-EXPR-AHMEDABAD",
                "name": "Sanand-Dholera Expressway Multi-Modal Logistics Hub",
                "type": "Industrial Expressway Node & EV Logistics Anchor",
                "dist": "GJ_AHMEDABAD",
                "state": "GJ",
                "lat": 22.9868,
                "lon": 72.3787,
                "capex": 1650.0,
                "go_live": "2026-12",
                "radius": 50.0,
                "lead": 8
            }
        ]

        for g in gs_nodes:
            rec = GatiShaktiProjectNode(
                node_id=g["node_id"],
                node_name=g["name"],
                corridor_type=g["type"],
                district_code=g["dist"],
                state_code=g["state"],
                latitude=g["lat"],
                longitude=g["lon"],
                investment_inr_cr=g["capex"],
                operational_go_live_target=g["go_live"],
                catchment_radius_km=g["radius"],
                lead_time_months=g["lead"]
            )
            db.add(rec)
        db.commit()
        print(f"   -> Seeded {len(gs_nodes)} PM Gati-Shakti infrastructure project nodes.")

    # 6. Seed Skill Obsolescence Metrics
    if db.query(SkillObsolescenceMetric).count() == 0:
        obs_data = [
            {
                "nco": "4132.0100",
                "ovs": 89.5,
                "tier": "CRITICAL_DISPLACEMENT_RISK",
                "drivers": ["Generative AI Document Extraction", "Robotic Process Automation", "Speech-to-Text Multilingual Voice AI"],
                "routine": 0.94,
                "horizon": 12,
                "pivot": "3511.0200",
                "module": "LEGO-AIDATA-35H",
                "hours": 35
            },
            {
                "nco": "7231.0100",
                "ovs": 81.0,
                "tier": "CRITICAL_DISPLACEMENT_RISK",
                "drivers": ["EV Fleet Electrification", "Elimination of Mechanical Fuel Injection", "400V Solid State Drivetrains"],
                "routine": 0.82,
                "horizon": 18,
                "pivot": "7231.0200",
                "module": "LEGO-EVBATT-45H",
                "hours": 45
            },
            {
                "nco": "7421.0100",
                "ovs": 74.5,
                "tier": "CRITICAL_DISPLACEMENT_RISK",
                "drivers": ["High-Speed Pick-and-Place SMT Lines", "Automated Optical Inspection (AOI)", "Robotic Selective Soldering"],
                "routine": 0.88,
                "horizon": 15,
                "pivot": "7421.0300",
                "module": "LEGO-SMT-40H",
                "hours": 40
            },
            {
                "nco": "7411.0100",
                "ovs": 28.0,
                "tier": "LOW_AI_RESILIENT",
                "drivers": ["High manual dexterity rooftop assembly", "Unstructured physical environments", "Safety-critical high-voltage grid link"],
                "routine": 0.32,
                "horizon": 48,
                "pivot": "7411.0200",
                "module": "LEGO-HTGRID-40H",
                "hours": 40
            },
            {
                "nco": "3258.0100",
                "ovs": 14.5,
                "tier": "LOW_AI_RESILIENT",
                "drivers": ["High empathy physical emergency care", "Dynamic trauma intervention", "AI operates as telemetry co-pilot"],
                "routine": 0.18,
                "horizon": 60,
                "pivot": "3258.0200",
                "module": "LEGO-TELEICU-30H",
                "hours": 30
            }
        ]

        for o in obs_data:
            rec = SkillObsolescenceMetric(
                nco_code=o["nco"],
                obsolescence_velocity_score_pct=o["ovs"],
                automation_risk_tier=o["tier"],
                technology_drivers_json=json.dumps(o["drivers"]),
                routineness_index=o["routine"],
                projected_displacement_months=o["horizon"],
                pivot_target_nco=o["pivot"],
                micro_credential_code=o["module"],
                training_duration_hours=o["hours"]
            )
            db.add(rec)
        db.commit()
        print(f"   -> Seeded {len(obs_data)} skill obsolescence metrics.")

    # 7. Seed CSR Corporate Grants
    if db.query(CSRCorporateGrant).count() == 0:
        csr_data = [
            {
                "opp_id": "CSR-OPP-PUN-TATA",
                "corporate": "Tata Motors CSR Foundation",
                "sector": "GREEN_ENERGY",
                "district": "MH_PUNE",
                "nco": "7231.0200",
                "grant": 48.0,
                "trainees": 320,
                "captive": 75.0,
                "sroi": 8.4,
                "alignment": "Direct feeder for Tata Passenger EV and Commercial Fleet dealer service centers across Western Maharashtra."
            },
            {
                "opp_id": "CSR-OPP-KAN-ADANI",
                "corporate": "Adani Green Energy CSR Trust",
                "sector": "GREEN_ENERGY",
                "district": "UP_KANPUR",
                "nco": "7411.0100",
                "grant": 52.0,
                "trainees": 400,
                "captive": 70.0,
                "sroi": 9.1,
                "alignment": "Empowers PM Surya Ghar Muft Bijli Yojana installation targets and solar EPC turnkey contractors in Central UP."
            },
            {
                "opp_id": "CSR-OPP-AHM-MARUTI",
                "corporate": "Maruti Suzuki Foundation for Skill Development",
                "sector": "ESDM",
                "district": "GJ_AHMEDABAD",
                "nco": "7421.0300",
                "grant": 42.0,
                "trainees": 280,
                "captive": 80.0,
                "sroi": 7.8,
                "alignment": "Supplies certified SMT printed circuit board assembly line technicians for Sanand electronics automotive hub."
            }
        ]

        for c in csr_data:
            rec = CSRCorporateGrant(
                opportunity_id=c["opp_id"],
                corporate_partner_name=c["corporate"],
                focus_sector_code=c["sector"],
                district_code=c["district"],
                target_nco_code=c["nco"],
                grant_amount_lakhs=c["grant"],
                annual_target_trainees=c["trainees"],
                captive_hiring_pledge_pct=c["captive"],
                sroi_ratio=c["sroi"],
                strategic_alignment=c["alignment"]
            )
            db.add(rec)
        db.commit()
        print(f"   -> Seeded {len(csr_data)} CSR corporate co-investment grant opportunities.")
