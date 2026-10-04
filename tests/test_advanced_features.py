import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.gati_shakti import gati_shakti_service
from app.services.obsolescence_radar import obsolescence_radar_service
from app.services.csr_matchmaker import csr_matchmaker_service

client = TestClient(app)


# ==========================================================
# 1. PM Gati-Shakti Multi-Modal Infrastructure Catchment
# ==========================================================
def test_gati_shakti_service():
    nodes = gati_shakti_service.list_all_corridor_nodes()
    assert len(nodes) >= 3
    assert any("DFC" in n.corridor_type for n in nodes)

    audit = gati_shakti_service.audit_catchment_area("MH_PUNE", 50.0)
    assert audit.district_code == "MH_PUNE"
    assert audit.total_projected_logistics_workforce > 500
    assert len(audit.local_itis_in_catchment) >= 2
    assert audit.overall_catchment_readiness_pct > 50.0
    assert audit.total_capex_upgrade_budget_lakhs > 0

    sim = gati_shakti_service.simulate_corridor_expansion(
        project_title="Western Dedicated Freight Expressway Spur",
        district_code="MH_PUNE",
        investment_inr_cr=1200.0
    )
    assert sim["derived_workforce_demand"] > 500
    assert len(sim["breakdown"]) == 4


def test_gati_shakti_endpoints():
    res_nodes = client.get("/api/v1/gati-shakti/corridors")
    assert res_nodes.status_code == 200
    assert len(res_nodes.json()) >= 3

    res_audit = client.get("/api/v1/gati-shakti/catchment-audit?node_id_or_district=MH_PUNE")
    assert res_audit.status_code == 200
    data = res_audit.json()
    assert data["district_code"] == "MH_PUNE"
    assert "local_itis_in_catchment" in data

    res_sim = client.post("/api/v1/gati-shakti/simulate-corridor-expansion?project_title=Sanand+Logistic+Park&district_code=GJ_AHMEDABAD&investment_inr_cr=800.0")
    assert res_sim.status_code == 200
    sim_data = res_sim.json()
    assert sim_data["derived_workforce_demand"] > 0


# ==========================================================
# 2. AI Automation & Skill-Obsolescence Radar
# ==========================================================
def test_obsolescence_radar_service():
    matrix = obsolescence_radar_service.get_trade_risk_matrix()
    assert len(matrix) >= 5
    # First item should be the highest risk
    assert matrix[0].obsolescence_velocity_score_pct >= matrix[-1].obsolescence_velocity_score_pct
    assert matrix[0].automation_risk_tier == "CRITICAL_DISPLACEMENT_RISK"

    vuln = obsolescence_radar_service.assess_district_vulnerability("MH_PUNE", "Pune")
    assert vuln.district_code == "MH_PUNE"
    assert vuln.headcount_at_critical_risk > 1000
    assert len(vuln.top_vulnerable_trades) >= 2

    pathway = obsolescence_radar_service.generate_preemptive_pathway("4132.0100")
    assert pathway.source_nco == "4132.0100"
    assert pathway.target_nco == "3511.0200"
    assert pathway.duration_hours <= 50
    assert pathway.wage_premium_projected_pct > 20.0


def test_obsolescence_radar_endpoints():
    res_matrix = client.get("/api/v1/obsolescence/trade-risk-matrix")
    assert res_matrix.status_code == 200
    assert len(res_matrix.json()) >= 5

    res_vuln = client.get("/api/v1/obsolescence/district-vulnerability?district_code=UP_KANPUR&district_name=Kanpur")
    assert res_vuln.status_code == 200
    vuln_data = res_vuln.json()
    assert vuln_data["headcount_at_critical_risk"] > 0

    res_pathway = client.post("/api/v1/obsolescence/generate-preemptive-pathway?source_nco_code=7231.0100")
    assert res_pathway.status_code == 200
    plan = res_pathway.json()
    assert plan["source_nco"] == "7231.0100"
    assert "future_readiness_score_pct" in plan


# ==========================================================
# 3. CSR & Private Capex Co-Investment Matchmaker
# ==========================================================
def test_csr_matchmaker_service():
    opps = csr_matchmaker_service.list_curated_opportunities()
    assert len(opps) >= 3
    assert any("Tata" in o.corporate_partner_name for o in opps)

    dpr = csr_matchmaker_service.generate_bankable_dpr("MH_PUNE", "Tata Motors CSR Foundation", "7231.0200")
    assert dpr.district_code == "MH_PUNE"
    assert dpr.social_return_on_investment_sroi > 5.0
    assert dpr.annual_training_capacity >= 200
    assert "corporate_obligations" in dpr.co_investment_term_sheet

    calc = csr_matchmaker_service.calculate_custom_sroi(
        csr_grant_lakhs=45.0,
        annual_trainees=300,
        baseline_monthly_wage=12000.0,
        post_certified_monthly_wage=26000.0
    )
    assert calc["social_return_on_investment_ratio"] > 5.0


def test_csr_matchmaker_endpoints():
    res_opps = client.get("/api/v1/csr/opportunities")
    assert res_opps.status_code == 200
    assert len(res_opps.json()) >= 3

    res_dpr = client.post("/api/v1/csr/generate-bankable-dpr?district_code=MH_PUNE")
    assert res_dpr.status_code == 200
    dpr_data = res_dpr.json()
    assert dpr_data["social_return_on_investment_sroi"] > 0
    assert len(dpr_data["issuing_entities"]) >= 2

    res_calc = client.get("/api/v1/csr/sroi-calculator?csr_grant_lakhs=50.0&annual_trainees=250")
    assert res_calc.status_code == 200
    calc_data = res_calc.json()
    assert calc_data["social_return_on_investment_ratio"] > 0
