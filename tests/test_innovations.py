import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.tender_nlp import tender_nlp_service
from app.services.material_proxy import material_proxy_service
from app.services.micro_credential import lego_micro_service
from app.services.whatsapp_gig import whatsapp_gig_service
from app.services.migration_reversal import migration_reversal_service

client = TestClient(app)


# ==========================================================
# 1. Forward-Predictive NLP on Government Tenders (GeM/CPPP)
# ==========================================================
def test_tender_nlp_boq_service():
    res = tender_nlp_service.parse_tender_text(
        tender_id="GEM/2026/SOLAR/99",
        tender_title="200MW Solar Park Installation",
        scope_description="Mounting solar photovoltaic modules, string inverters, and high tension sub-station",
        tender_value_cr=350.0,
        district_code="MH_NAGPUR",
        district_name="Nagpur"
    )
    assert res.tender_id == "GEM/2026/SOLAR/99"
    assert res.total_projected_workforce > 500
    assert res.lead_time_months_before_hiring >= 6
    assert len(res.bill_of_qualifications) >= 2
    assert "Solar" in res.bill_of_qualifications[0].trade_title


def test_tenders_api_endpoint():
    res = client.post("/api/v1/tenders/parse-and-extract-boq?tender_value_cr=250.0&district_code=MH_PUNE")
    assert res.status_code == 200
    data = res.json()
    assert data["estimated_value_inr_cr"] == 250.0
    assert len(data["bill_of_qualifications"]) > 0

    res_pipe = client.get("/api/v1/tenders/pipeline")
    assert res_pipe.status_code == 200
    assert len(res_pipe.json()) >= 3


# ==========================================================
# 2. Informal Sector Proxy Tracking via Material Consumption
# ==========================================================
def test_material_consumption_proxy_service():
    rep = material_proxy_service.generate_district_informal_demand(
        district_code="MH_PUNE",
        district_name="Pune",
        consumption_multiplier=1.25
    )
    assert rep.total_informal_grassroots_demand > 200
    assert len(rep.commodity_signals) == 4
    cement_sig = next(s for s in rep.commodity_signals if "CEMENT" in s.commodity_code)
    assert cement_sig.derived_informal_headcount_demand > 0


def test_material_proxy_api_endpoint():
    res = client.get("/api/v1/proxies/material-consumption?district_code=MH_PUNE&consumption_surge_multiplier=1.30")
    assert res.status_code == 200
    data = res.json()
    assert data["district_code"] == "MH_PUNE"
    assert data["total_informal_grassroots_demand"] > 0
    assert len(data["commodity_signals"]) > 0


# ==========================================================
# 3. "Lego-Block" Micro-Credential Pivot Recommendations
# ==========================================================
def test_lego_micro_credential_service():
    plan = lego_micro_service.generate_pivot_recommendation(
        source_nco="7411.0100",
        target_nco="7411.0300",
        district_code="MH_PUNE",
        district_name="Pune",
        surplus_trainees=600
    )
    assert plan.surplus_trainees_available == 600
    assert plan.lego_block_micro_credential.training_duration_hours <= 45
    assert plan.infrastructure_preservation_ratio_pct > 80.0
    assert plan.total_pivot_budget_lakhs > 0


def test_lego_api_endpoint():
    res = client.get("/api/v1/lego/pivot-recommendation?source_nco=7411.0100&target_nco=7411.0300&surplus_trainees=400")
    assert res.status_code == 200
    data = res.json()
    assert data["infrastructure_preservation_ratio_pct"] >= 80.0
    assert "lego_block_micro_credential" in data


# ==========================================================
# 4. WhatsApp "Gig-Signal" Engine for MSMEs
# ==========================================================
def test_whatsapp_gig_signal_service():
    msg = "Pune Bhosari MIDC mein kal 20 EV battery aur motor technicians chahiye urgently"
    res = whatsapp_gig_service.process_incoming_whatsapp_message("+919822100000", msg)
    assert res.extracted_district == "Pune"
    assert res.extracted_headcount == 20
    assert "EV" in res.extracted_trade_title or "Battery" in res.extracted_trade_title
    assert len(res.matched_certified_candidates) > 0
    assert "Namaste" in res.automated_whatsapp_reply


def test_whatsapp_api_endpoint():
    payload_msg = "Kanpur mein agle hafte 15 solar panel installation technicians chahiye"
    res = client.post(f"/api/v1/whatsapp/ingest-gig-signal?contractor_phone=%2B919415000000&message_text={payload_msg}")
    assert res.status_code == 200
    data = res.json()
    assert data["extracted_district"] == "Kanpur"
    assert data["extracted_headcount"] == 15
    assert len(data["matched_certified_candidates"]) > 0


# ==========================================================
# 5. Migration-Reversal Heatmaps (IRCTC + e-Shram)
# ==========================================================
def test_migration_reversal_service():
    rep = migration_reversal_service.generate_reversal_heatmap("2026-W42")
    assert rep.total_interstate_migrants_tracked > 10000
    assert len(rep.top_transit_corridors) >= 3
    assert "INDUSTRIAL HOST ALERT" in rep.industrial_host_warning


def test_migration_heatmaps_api_endpoint():
    res = client.get("/api/v1/migration-heatmaps/railway-transit-flows?reporting_week=2026-W42")
    assert res.status_code == 200
    data = res.json()
    assert data["total_interstate_migrants_tracked"] > 0
    assert len(data["top_transit_corridors"]) >= 3
