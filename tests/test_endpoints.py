import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"


def test_taxonomy_sectors():
    res = client.get("/api/v1/taxonomy/sectors")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 4
    sector_codes = [s["code"] for s in data]
    assert "GREEN_ENERGY" in sector_codes
    assert "ESDM" in sector_codes
    assert "HEALTHCARE" in sector_codes
    assert "IT_ITES" in sector_codes


def test_taxonomy_match_job_ai():
    # Test AI mapping for raw unstructured text
    res = client.post(
        "/api/v1/taxonomy/match-job",
        json={"query_text": "Solar panel technician for rooftop grid inverter installation", "top_k": 3}
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data["matches"]) > 0
    top_match = data["matches"][0]
    assert top_match["nco_code"] == "7411.0100"  # Solar PV Rooftop Installer
    assert top_match["nsqf_level"] == 4


def test_demand_summary():
    res = client.get("/api/v1/demand/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["total_active_postings"] > 0
    assert data["total_capex_cr"] > 0
    assert len(data["top_demanded_trades"]) > 0


def test_supply_summary():
    res = client.get("/api/v1/supply/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["total_training_centers"] > 0
    assert data["total_sanctioned_seats"] > 0
    assert data["total_effective_supply"] > 0


def test_forecasting_model_metrics():
    res = client.get("/api/v1/forecasting/model-metrics")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "TRAINED_AND_ACTIVE"
    assert data["r2_score"] > 0.90
    assert "demand_lag1" in data["feature_importances"]


def test_forecasting_12m_and_24m():
    # 12 months
    res12 = client.get("/api/v1/forecasting/trajectory?district_code=MH_PUNE&nco_code=7411.0100&horizon_months=12")
    assert res12.status_code == 200
    d12 = res12.json()
    assert len(d12["future_points"]) == 12
    assert d12["district_code"] == "MH_PUNE"

    # 24 months
    res24 = client.get("/api/v1/forecasting/trajectory?district_code=MH_PUNE&nco_code=7411.0100&horizon_months=24")
    assert res24.status_code == 200
    d24 = res24.json()
    assert len(d24["future_points"]) == 24


def test_mismatch_dashboard():
    res = client.get("/api/v1/mismatch/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert data["total_shortage_headcount"] > 0
    assert len(data["top_undersupplied_trades"]) > 0
    assert len(data["top_oversupplied_trades"]) > 0
    assert len(data["active_early_warnings"]) > 0
    assert len(data["district_heatmaps"]) > 0


def test_skill_graph_bridge_recommendations():
    res = client.get("/api/v1/skills/bridge-recommendations?source_nco_code=7231.0100&surplus_candidates=450")
    assert res.status_code == 200
    data = res.json()
    assert data["source_nco_code"] == "7231.0100"
    assert len(data["adjacent_transition_pathways"]) > 0
    assert "bridge course" in data["policy_summary"].lower()


def test_simulation_what_if():
    payload = {
        "scenario_name": "Test Simulation",
        "target_sector_code": "GREEN_ENERGY",
        "target_district_code": "MH_PUNE",
        "capex_injection_cr": 300.0,
        "additional_seats_sanctioned": 1500,
        "training_stipend_boost_pct": 20.0,
        "simulation_horizon_months": 12
    }
    res = client.post("/api/v1/simulation/what-if", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["gap_mitigation_efficiency_pct"] > 0
    assert len(data["monthly_trajectory"]) == 12


def test_optimizer_endpoint():
    payload = {
        "target_cycle": "2026-27",
        "max_seat_variation_pct": 20.0,
        "total_budget_cap_cr": 250.0
    }
    res = client.post("/api/v1/optimizer/optimize", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["total_trades_optimized"] > 0
    assert len(data["allocations"]) > 0


def test_exports_csv_and_policy_brief():
    # CSV Sanction Plan
    res_csv = client.get("/api/v1/exports/sanction-plan-csv")
    assert res_csv.status_code == 200
    assert "Target Cycle,District Code" in res_csv.text

    # Policy Brief JSON
    res_brief = client.get("/api/v1/exports/executive-policy-brief")
    assert res_brief.status_code == 200
    assert "EXECUTIVE LABOUR MARKET INTELLIGENCE" in res_brief.json()["title"]


def test_curriculum_audit_endpoints():
    # 1. Audit single trade
    res = client.get("/api/v1/curriculum/audit/7411.0100")
    assert res.status_code == 200
    d = res.json()
    assert d["nco_code"] == "7411.0100"
    assert d["obsolescence_rate_pct"] > 0
    assert len(d["critical_missing_competencies"]) > 0

    # 2. National high-risk ranking
    res_high = client.get("/api/v1/curriculum/high-risk-trades")
    assert res_high.status_code == 200
    assert len(res_high.json()) > 0

    # 3. Generate NCVET Addendum
    res_memo = client.post("/api/v1/curriculum/generate-revision-addendum?nco_code=7411.0100")
    assert res_memo.status_code == 200
    assert "MEMORANDUM" in res_memo.json()["official_memo_draft"]


def test_mobility_corridor_endpoints():
    # 1. Fetch corridors
    res = client.get("/api/v1/mobility/corridors")
    assert res.status_code == 200
    corridors = res.json()
    assert len(corridors) > 0
    top = corridors[0]
    assert top["origin_district_code"] != top["destination_district_code"]
    assert top["cost_saving_vs_building_new_iti_lakhs"] > 0

    # 2. Simulate relocation policy
    payload = {
        "origin_district_code": "UP_KANPUR",
        "destination_district_code": "MH_PUNE",
        "nco_code": "7231.0200",
        "mobility_voucher_subsidy_per_candidate_inr": 9000.0,
        "target_relocation_quota": 300
    }
    res_sim = client.post("/api/v1/mobility/simulate-relocation-policy", json=payload)
    assert res_sim.status_code == 200
    sim_d = res_sim.json()
    assert sim_d["origin_unemployment_reduction"] == 300
    assert sim_d["net_government_savings_lakhs"] > 0
    assert sim_d["roi_multiple"] > 1.0

