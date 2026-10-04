import pytest
from app.services.cdi_engine import cdi_engine
from app.services.supply_engine import supply_engine
from app.services.forecasting_engine import forecasting_engine
from app.services.skill_graph_engine import skill_graph_engine
from app.services.optimizer_engine import target_optimizer_engine
from app.services.simulation_engine import simulation_engine
from app.schemas.simulation import SimulationScenarioRequest
from app.schemas.policy import OptimizerRequest


def test_cdi_engine_computation():
    """Test Composite Demand Index logic and component weighting."""
    calc = cdi_engine.calculate_cdi(
        active_postings=450,
        capex_inr_cr=1200.0,
        expected_direct_jobs=1500,
        hiring_velocity=2.2,
        median_wage_inr=24000.0,
        inbound_migration_flow=180
    )
    assert 0.0 <= calc["cdi_score"] <= 100.0
    assert calc["projected_headcount_demand"] > 450
    assert "posting_component" in calc
    assert "capex_component" in calc


def test_supply_engine_discounting():
    """Test effective supply discounting by completion and migration rates."""
    sup = supply_engine.calculate_effective_supply(
        sanctioned_seats=100,
        enrolled_trainees=90,
        pass_completion_rate=0.80,
        local_retention_rate=0.50,
        eshram_active_seekers=100
    )
    assert sup["certified_passouts"] == 72
    assert sup["effective_local_supply"] > 0
    assert sup["effective_local_supply"] <= 100


def test_forecasting_engine_12m_and_24m():
    """Test 12M and 24M time-series forecast generation with confidence bands."""
    hist_d = [200.0, 215.0, 230.0, 245.0, 260.0, 280.0]
    hist_s = [180.0, 185.0, 190.0, 195.0, 200.0, 205.0]

    # 12-month horizon
    f12 = forecasting_engine.forecast_trajectory(hist_d, hist_s, horizon_months=12)
    assert len(f12) == 12
    for p in f12:
        assert p.projected_demand_p10 <= p.projected_demand_p50 <= p.projected_demand_p90
        assert p.mismatch_ratio > 0

    # 24-month horizon
    f24 = forecasting_engine.forecast_trajectory(hist_d, hist_s, horizon_months=24)
    assert len(f24) == 24
    assert f24[-1].period.startswith("2028-")


def test_skill_graph_bridge_recommendations():
    """Test Skill Adjacency Graph bridge recommendations for saturated trades."""
    mock_taxonomies = [
        {
            "nco_code": "7231.0100",
            "title": "Diesel Mechanic",
            "sector_code": "GREEN_ENERGY",
            "nsqf_level": 3,
            "core_skills": ["Automotive Wiring", "Cooling Systems", "Engine Overhaul", "Workshop Safety"],
            "is_emerging": False,
            "is_legacy_at_risk": True
        },
        {
            "nco_code": "7231.0200",
            "title": "EV Battery Technician",
            "sector_code": "GREEN_ENERGY",
            "nsqf_level": 4,
            "core_skills": ["Automotive Wiring", "Cooling Systems", "Battery Pack Assembly", "BMS Diagnostics"],
            "is_emerging": True,
            "is_legacy_at_risk": False
        }
    ]
    skill_graph_engine.load_taxonomy(mock_taxonomies)
    rec = skill_graph_engine.get_bridge_recommendations("7231.0100", surplus_candidates=300)
    
    assert rec.source_nco_code == "7231.0100"
    assert len(rec.adjacent_transition_pathways) > 0
    top_path = rec.adjacent_transition_pathways[0]
    assert top_path.target_nco_code == "7231.0200"
    assert top_path.skill_overlap_pct >= 30.0
    assert 4 <= top_path.recommended_bridge_weeks <= 12

    # Restore official taxonomy in memory
    from app.core.database import SessionLocal
    from app.models.taxonomy import NCOOccupation
    db = SessionLocal()
    try:
        all_occs = db.query(NCOOccupation).all()
        if all_occs:
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
                for o in all_occs
            ]
            skill_graph_engine.load_taxonomy(occ_list)
    finally:
        db.close()


def test_target_optimizer():
    """Test constrained annual target allocation optimization within +/- 20% limit."""
    mock_data = [
        {
            "district_code": "MH_PUNE",
            "district_name": "Pune",
            "nco_code": "7411.0100",
            "trade_title": "Solar PV Installer",
            "sector_code": "GREEN_ENERGY",
            "current_seats": 100,
            "projected_demand": 350
        },
        {
            "district_code": "UP_KANPUR",
            "district_name": "Kanpur Nagar",
            "nco_code": "7231.0100",
            "trade_title": "Diesel Mechanic",
            "sector_code": "GREEN_ENERGY",
            "current_seats": 200,
            "projected_demand": 60
        }
    ]
    req = OptimizerRequest(target_cycle="2026-27", max_seat_variation_pct=20.0, total_budget_cap_cr=100.0)
    res = target_optimizer_engine.optimize_allocations(mock_data, req)
    
    assert res.total_trades_optimized == 2
    assert res.projected_gap_reduction_pct > 0
    
    # Check that Pune expanded seats within +20%
    solar_row = next(r for r in res.allocations if r.nco_code == "7411.0100")
    assert solar_row.recommended_seats == 120 # 100 + 20%
    assert solar_row.action == "EXPAND_CAPACITY"

    # Check that Kanpur reduced seats within -20%
    diesel_row = next(r for r in res.allocations if r.nco_code == "7231.0100")
    assert diesel_row.recommended_seats == 160 # 200 - 20%
    assert diesel_row.action == "REDUCE_AND_BRIDGE"


def test_simulation_engine():
    """Test What-If simulation with Capex shock and additional seats."""
    req = SimulationScenarioRequest(
        scenario_name="Test Green Mission",
        target_sector_code="GREEN_ENERGY",
        capex_injection_cr=200.0,
        additional_seats_sanctioned=800,
        training_stipend_boost_pct=15.0,
        simulation_horizon_months=12
    )
    res = simulation_engine.run_simulation(req, baseline_demand_total=2500, baseline_supply_total=1400)
    assert len(res.monthly_trajectory) == 12
    assert res.gap_mitigation_efficiency_pct > 0
    assert res.projected_additional_placements > 0


def test_curriculum_analyzer_obsolescence():
    """Test NCVET curriculum obsolescence audit and addendum generation (Feature 1)."""
    from app.services.curriculum_analyzer import curriculum_analyzer_service

    # Audit Solar PV trade
    audit = curriculum_analyzer_service.audit_trade("7411.0100")
    assert audit.nco_code == "7411.0100"
    assert audit.obsolescence_rate_pct > 25.0
    assert len(audit.critical_missing_competencies) > 0
    assert len(audit.lab_equipment_gap) > 0

    # Generate official revision addendum memo
    addendum = curriculum_analyzer_service.generate_revision_addendum("7411.0100")
    assert "NCVET/MSDE/2026/REV" in addendum.revision_reference_code
    assert "MEMORANDUM" in addendum.official_memo_draft
    assert addendum.estimated_implementation_cost_per_center_inr > 0


def test_spatial_gravity_engine():
    """Test Inter-District spatial gravity mobility corridor model (Feature 2)."""
    from app.services.spatial_gravity_engine import spatial_gravity_engine, haversine_distance_km
    from app.schemas.mobility import RelocationSimulationRequest

    dist = haversine_distance_km(26.4499, 80.3319, 18.5204, 73.8567) # Kanpur to Pune
    assert dist > 1000.0

    orig = {"code": "UP_KANPUR", "name": "Kanpur", "state_code": "UP", "latitude": 26.4499, "longitude": 80.3319, "surplus_headcount": 350, "median_wage_inr": 15000.0}
    dest = {"code": "MH_PUNE", "name": "Pune", "state_code": "MH", "latitude": 18.5204, "longitude": 73.8567, "deficit_headcount": 600, "median_wage_inr": 26000.0}
    trade = {"nco_code": "7231.0200", "title": "EV Technician"}

    corridor = spatial_gravity_engine.compute_corridor_potential(orig, dest, trade)
    assert corridor.origin_district_code == "UP_KANPUR"
    assert corridor.destination_district_code == "MH_PUNE"
    assert corridor.wage_premium_pct > 50.0
    assert corridor.gravity_mobility_score > 0
    assert corridor.cost_saving_vs_building_new_iti_lakhs > 0

    # Policy simulation
    sim_req = RelocationSimulationRequest(
        origin_district_code="UP_KANPUR",
        destination_district_code="MH_PUNE",
        nco_code="7231.0200",
        mobility_voucher_subsidy_per_candidate_inr=9000.0,
        target_relocation_quota=250
    )
    sim_res = spatial_gravity_engine.simulate_relocation_policy(sim_req, orig, dest)
    assert sim_res.origin_unemployment_reduction == 250
    assert sim_res.roi_multiple > 1.0
    assert sim_res.net_government_savings_lakhs > 0

