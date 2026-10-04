import sys
import time
import json
import urllib.request
import urllib.parse
from typing import Dict, Any, List

BASE_URL = "http://127.0.0.1:8000"

ENDPOINTS_TO_TEST: List[Dict[str, Any]] = [
    # 1. System Health
    {"category": "Health", "name": "Root Gateway", "method": "GET", "path": "/"},
    {"category": "Health", "name": "Health Status", "method": "GET", "path": "/health"},

    # 2. Taxonomy & NLP Job Matcher
    {"category": "Taxonomy", "name": "List Sectors", "method": "GET", "path": "/api/v1/taxonomy/sectors"},
    {"category": "Taxonomy", "name": "List Occupations", "method": "GET", "path": "/api/v1/taxonomy/occupations"},
    {
        "category": "Taxonomy",
        "name": "Match Job AI (NLP)",
        "method": "POST",
        "path": "/api/v1/taxonomy/match-job",
        "json_body": {
            "query_text": "Need certified solar rooftop installer with electrical knowledge",
            "top_k": 3
        }
    },

    # 3. Demand & CDI
    {"category": "Demand", "name": "Demand Summary", "method": "GET", "path": "/api/v1/demand/summary"},
    {"category": "Demand", "name": "Capex Projects", "method": "GET", "path": "/api/v1/demand/capex"},

    # 4. Supply & Capacity
    {"category": "Supply", "name": "Supply Summary", "method": "GET", "path": "/api/v1/supply/summary"},
    {"category": "Supply", "name": "Training Centers", "method": "GET", "path": "/api/v1/supply/centers"},

    # 5. Forecasting (12M & 24M Horizons)
    {"category": "Forecasting", "name": "Model Metrics", "method": "GET", "path": "/api/v1/forecasting/model-metrics"},
    {"category": "Forecasting", "name": "12M Trajectory", "method": "GET", "path": "/api/v1/forecasting/trajectory?district_code=MH_PUNE&nco_code=7411.0100&horizon_months=12"},
    {"category": "Forecasting", "name": "24M Trajectory", "method": "GET", "path": "/api/v1/forecasting/trajectory?district_code=MH_PUNE&nco_code=7411.0100&horizon_months=24"},

    # 6. Mismatch & Early Warnings
    {"category": "Mismatch", "name": "Mismatch Dashboard", "method": "GET", "path": "/api/v1/mismatch/dashboard"},
    {"category": "Mismatch", "name": "District Drilldown", "method": "GET", "path": "/api/v1/mismatch/district/MH_PUNE"},

    # 7. Skill Graph & Bridge Courses
    {"category": "Skill Graph", "name": "Network Graph Topology", "method": "GET", "path": "/api/v1/skills/network"},
    {"category": "Skill Graph", "name": "Bridge Course Recommendations", "method": "GET", "path": "/api/v1/skills/bridge-recommendations?source_nco_code=7231.0100&surplus_candidates=500"},

    # 8. Policy Simulation Sandbox
    {
        "category": "Simulation",
        "name": "What-If Policy Sandbox",
        "method": "POST",
        "path": "/api/v1/simulation/what-if",
        "json_body": {
            "scenario_name": "Test Simulation Run",
            "target_sector_code": "GREEN_ENERGY",
            "target_district_code": "MH_PUNE",
            "capex_injection_cr": 250.0,
            "additional_seats_sanctioned": 1500,
            "training_stipend_boost_pct": 15.0,
            "simulation_horizon_months": 12
        }
    },

    # 9. Autonomous Target Optimizer
    {
        "category": "Optimizer",
        "name": "Constrained Seat Optimizer",
        "method": "POST",
        "path": "/api/v1/optimizer/optimize",
        "json_body": {
            "target_state_code": "MH",
            "max_reallocation_pct": 20.0,
            "budget_cap_lakhs": 5000.0,
            "priority_sector_codes": ["GREEN_ENERGY", "ESDM"]
        }
    },

    # 10. Curriculum Obsolescence Audit
    {"category": "Curriculum", "name": "High-Risk Obsolescent Trades", "method": "GET", "path": "/api/v1/curriculum/high-risk-trades"},
    {"category": "Curriculum", "name": "Deep Curriculum Audit", "method": "GET", "path": "/api/v1/curriculum/audit/7411.0100"},

    # 11. Spatial Labour Mobility
    {"category": "Mobility", "name": "Gravity Corridors", "method": "GET", "path": "/api/v1/mobility/corridors"},
    {
        "category": "Mobility",
        "name": "Relocation Voucher Policy Simulation",
        "method": "POST",
        "path": "/api/v1/mobility/simulate-relocation-policy",
        "json_body": {
            "origin_district_code": "UP_KANPUR",
            "destination_district_code": "MH_PUNE",
            "nco_code": "7231.0200",
            "relocation_voucher_amount_inr": 15000.0,
            "target_migrant_cohort_size": 250
        }
    },

    # 12. GeM / CPPP Forward-Predictive Tenders
    {"category": "Tenders (BoQ)", "name": "Tender Pipeline", "method": "GET", "path": "/api/v1/tenders/pipeline"},
    {"category": "Tenders (BoQ)", "name": "Parse Tender & Extract BoQ", "method": "POST", "path": "/api/v1/tenders/parse-and-extract-boq?tender_value_cr=350.0&district_code=MH_PUNE"},

    # 13. Informal Material Consumption Proxies
    {"category": "Material Proxies", "name": "Commodity Consumption Demand", "method": "GET", "path": "/api/v1/proxies/material-consumption?district_code=MH_PUNE&consumption_surge_multiplier=1.20"},

    # 14. Lego-Block Micro-Credentials
    {"category": "Lego-Block Pivots", "name": "Micro-Credential Pivot Plan", "method": "GET", "path": "/api/v1/lego/pivot-recommendation?source_nco=7411.0100&target_nco=7411.0300&surplus_trainees=500"},

    # 15. WhatsApp MSME Gig Engine
    {"category": "WhatsApp Gig Engine", "name": "Ingest Gig Intent & Match Candidates", "method": "POST", "path": "/api/v1/whatsapp/ingest-gig-signal?contractor_phone=%2B919822100000&message_text=Pune+mein+20+EV+battery+technicians+chahiye"},

    # 16. Migration-Reversal Heatmaps (IRCTC)
    {"category": "Migration Heatmaps", "name": "Railway Transit Passenger Flows", "method": "GET", "path": "/api/v1/migration-heatmaps/railway-transit-flows?reporting_week=2026-W42"},

    # 17. PM Gati-Shakti Multi-Modal Infrastructure Catchment
    {"category": "Gati-Shakti", "name": "Corridor Nodes Catalog", "method": "GET", "path": "/api/v1/gati-shakti/corridors"},
    {"category": "Gati-Shakti", "name": "Catchment Audit (50km)", "method": "GET", "path": "/api/v1/gati-shakti/catchment-audit?node_id_or_district=MH_PUNE&catchment_radius_km=50"},
    {"category": "Gati-Shakti", "name": "Simulate Corridor Expansion", "method": "POST", "path": "/api/v1/gati-shakti/simulate-corridor-expansion?project_title=Sanand+Logistics+Node&district_code=GJ_AHMEDABAD&investment_inr_cr=1200.0"},

    # 18. AI Automation & Skill Obsolescence Radar
    {"category": "Obsolescence Radar", "name": "Trade Risk Matrix", "method": "GET", "path": "/api/v1/obsolescence/trade-risk-matrix"},
    {"category": "Obsolescence Radar", "name": "District Automation Vulnerability", "method": "GET", "path": "/api/v1/obsolescence/district-vulnerability?district_code=MH_PUNE&district_name=Pune"},
    {"category": "Obsolescence Radar", "name": "Preemptive Reskilling Pathway", "method": "POST", "path": "/api/v1/obsolescence/generate-preemptive-pathway?source_nco_code=4132.0100"},

    # 19. CSR & Private Co-Investment Matchmaker
    {"category": "CSR Matchmaker", "name": "CSR Match Pipeline", "method": "GET", "path": "/api/v1/csr/opportunities"},
    {"category": "CSR Matchmaker", "name": "Bankable DPR Generator", "method": "POST", "path": "/api/v1/csr/generate-bankable-dpr?district_code=MH_PUNE"},
    {"category": "CSR Matchmaker", "name": "SROI Calculator", "method": "GET", "path": "/api/v1/csr/sroi-calculator?csr_grant_lakhs=45.0&annual_trainees=300"},

    # 20. Official Policy Exports
    {"category": "Policy Exports", "name": "Sanction Plan CSV", "method": "GET", "path": "/api/v1/exports/sanction-plan-csv?district_code=MH_PUNE"},
    {"category": "Policy Exports", "name": "Executive Policy Brief", "method": "GET", "path": "/api/v1/exports/executive-policy-brief?district_code=MH_PUNE"}
]


def run_full_suite():
    print(f"\n================================================================================")
    print(f"      MSDE APEX LMIS BACKEND COMPREHENSIVE END-TO-END AUDIT & VERIFICATION     ")
    print(f"================================================================================\n")
    print(f"Target Server: {BASE_URL}")
    print(f"Total Functional Endpoints to Audit: {len(ENDPOINTS_TO_TEST)}\n")

    results = []
    total_start = time.time()

    for idx, ep in enumerate(ENDPOINTS_TO_TEST, 1):
        full_url = f"{BASE_URL}{ep['path']}"
        data_bytes = None
        headers = {}

        if "json_body" in ep:
            data_bytes = json.dumps(ep["json_body"]).encode("utf-8")
            headers["Content-Type"] = "application/json"

        req = urllib.request.Request(full_url, data=data_bytes, headers=headers, method=ep["method"])
        start_t = time.time()
        status_code = None
        error_msg = None
        payload_size = 0

        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                status_code = resp.getcode()
                raw_bytes = resp.read()
                payload_size = len(raw_bytes)
                duration_ms = round((time.time() - start_t) * 1000, 1)
                success = (status_code == 200)
        except Exception as e:
            duration_ms = round((time.time() - start_t) * 1000, 1)
            status_code = getattr(e, "code", 500)
            error_msg = str(e)
            success = False

        status_str = "PASS" if success else "FAIL"
        print(f"[{idx:02d}/{len(ENDPOINTS_TO_TEST):02d}] [{status_str}] {ep['method']:<4} {ep['category']:<18} | {ep['name']:<38} ({duration_ms:>5.1f} ms, {payload_size:>5} B)")
        if not success:
            print(f"      ERROR: {error_msg}")

        results.append({
            "idx": idx,
            "category": ep["category"],
            "name": ep["name"],
            "path": ep["path"],
            "status_code": status_code,
            "duration_ms": duration_ms,
            "success": success
        })

    total_time = round(time.time() - total_start, 2)
    passed_count = sum(1 for r in results if r["success"])
    failed_count = len(results) - passed_count
    pass_pct = round((passed_count / len(results)) * 100.0, 1)
    avg_latency = round(sum(r["duration_ms"] for r in results) / len(results), 1)

    print("\n--------------------------------------------------------------------------------")
    print("AUDIT EXECUTIVE SUMMARY")
    print("--------------------------------------------------------------------------------")
    print(f"Total Endpoints Audited : {len(results)}")
    print(f"Passed Endpoints        : {passed_count}")
    print(f"Failed Endpoints        : {failed_count}")
    print(f"Pass Rate               : {pass_pct}%")
    print(f"Average Response Latency: {avg_latency} ms")
    print(f"Total Execution Time    : {total_time} s")
    print("--------------------------------------------------------------------------------\n")

    if failed_count == 0:
        print(">>> ALL 39 BACKEND ENDPOINTS AUDITED AND 100% OPERATIONAL WITH ZERO DEFECTS.")
        sys.exit(0)
    else:
        print(f">>> AUDIT FAILED WITH {failed_count} DEFECTS.")
        sys.exit(1)


if __name__ == "__main__":
    run_full_suite()
