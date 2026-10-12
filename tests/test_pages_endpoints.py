from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_page3_forecasting_trajectory():
    # 1. Base forecast test
    res = client.get("/api/v1/forecasting/trajectory?district_code=MH_PUNE&nco_code=7411.0100&horizon_months=12")
    assert res.status_code == 200, res.text
    data = res.json()
    assert len(data["future_points"]) == 12
    assert len(data["historical_points"]) > 0
    assert "cag_audit_hash" in data
    assert "peak_deficit_month" in data
    assert "at_risk_funds_cr" in data

    # 2. Multi-model & Macro-shock test
    res_shock = client.get(
        "/api/v1/forecasting/trajectory?district_code=MH_PUNE&nco_code=7411.0100&horizon_months=24"
        "&capex_boost_cr=450&inflation_rate_pct=6.5&fdi_inflow_cr=200&stipend_boost_pct=20&model_type=ENSEMBLE"
    )
    assert res_shock.status_code == 200, res_shock.text
    data_shock = res_shock.json()
    assert len(data_shock["future_points"]) == 24
    assert data_shock["macro_shock_impact"]["capex_boost_cr"] == 450.0

    last_pt = data_shock["future_points"][-1]
    assert last_pt["gbr_demand"] is not None
    assert last_pt["lstm_demand"] is not None
    assert last_pt["arima_demand"] is not None
    assert last_pt["projected_demand_p10"] <= last_pt["projected_demand_p50"] <= last_pt["projected_demand_p90"]
    print(">> Page 3 AI Forecasting Engine API: VERIFIED 100%")

def test_page5_skill_graph():
    # 1. Network Topology
    res_net = client.get("/api/v1/skills/network")
    assert res_net.status_code == 200, res_net.text
    net = res_net.json()
    assert len(net["nodes"]) > 0
    assert len(net["edges"]) > 0

    # 2. 30-Day Modular Bridge Recommendations
    res_bridge = client.get("/api/v1/skills/bridge-recommendations?source_nco_code=7231.0100&surplus_candidates=600")
    assert res_bridge.status_code == 200, res_bridge.text
    bridge = res_bridge.json()
    assert bridge["source_nco_code"] == "7231.0100"
    assert len(bridge["adjacent_transition_pathways"]) > 0

    top_path = bridge["adjacent_transition_pathways"][0]
    assert top_path["skill_overlap_pct"] > 50.0
    assert len(top_path["shared_skills"]) > 0
    assert len(top_path["missing_gap_skills"]) > 0
    assert top_path["recommended_bridge_weeks"] in [4, 5, 6, 8]
    print(">> Page 5 Skill Bridge & Career Transition Graph API: VERIFIED 100%")

if __name__ == "__main__":
    test_page3_forecasting_trajectory()
    test_page5_skill_graph()
    print(">> ALL INTEGRATION TESTS PASSED SUCCESSFULLY!")
