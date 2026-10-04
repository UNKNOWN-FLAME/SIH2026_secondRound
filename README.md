# AI-Enabled Labour Market Intelligence & Skill Demand-Supply Forecasting Engine (LMIS)
## SIH Problem Statement ID: 26246 | Ministry of Skill Development and Entrepreneurship (MSDE)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python)](https://python.org)
[![License](https://img.shields.io/badge/Standard-NCO--2015%20%7C%20NSQF-orange.svg)]()

A state-of-the-art **Labour Market Intelligence System (LMIS)** designed for the **Ministry of Skill Development & Entrepreneurship (MSDE)**, NCVET, and State Skill Development Missions. It transitions vocational training from reactive placement tracking to **proactive, lead-indicator-driven annual seat target allocation and curriculum forecasting**.

---

## 🌟 The 5 Winning Differentiators

1. **Lead-Indicator Multi-Source Demand Fusion**:
   - Goes beyond white-collar job scraping. Combines real job postings with **Industrial Capex/PLI investments** (e.g., PM Surya Ghar, Semiconductor Mission) and **e-Shram unorganized migration velocity** into a unified **Composite Demand Index (CDI)**.

2. **Skill Adjacency & Bridge-Course Recommender**:
   - When a legacy trade (e.g., *Automotive Diesel Mechanic*) suffers chronic oversupply, the AI maps its **Skill Distance Graph** to high-demand trades (e.g., *EV Powertrain Technician* with 72% skill overlap).
   - Recommends a **45-day NSQF-aligned bridge course** instead of closing training centers.

3. **Autonomous Policy Target Optimizer & What-If Sandbox**:
   - Formulates a constrained linear optimization model for MSDE planners to auto-generate the optimal annual training targets per district and trade within $\pm 20\%$ infrastructure bounds.
   - Interactive What-If simulation sandbox to test policy levers (e.g. ₹50 Cr capital injection in green jobs).

4. **NCVET Curriculum Obsolescence & Skill-Drift Analyzer (Winning Feature 1)**:
   - Evaluates official government Qualification Pack (QP-NOS) syllabi against real-time employer job specifications.
   - Identifies decaying legacy modules (e.g. carburetor tuning, lead-acid testing) and flags critical missing modern competencies (e.g. BESS storage, IoT SCADA, CAN-FD protocol).
   - Auto-generates official **NCVET Revision Addenda & Lab Modernization Memos** for DSDO funding.

5. **Inter-District Spatial Labour Mobility & Gravity Corridor Engine (Winning Feature 2)**:
   - Uses spatial econometrics (Newtonian Gravity model adapted for labor markets) to discover natural talent flow corridors between surplus origin districts and high-deficit industrial hubs.
   - Computes wage draw, transit friction, and recommends targeted **MSDE Relocation Vouchers** (₹3,000/mo x 3 months) that fulfill industry demand while averting crores in redundant brick-and-mortar ITI capex.

---

## 🎯 4 Pilot Sectors

1. **Green Energy & Clean Mobility**: Solar PV Rooftop Installer, EV Powertrain & Battery Tech vs. Diesel Mechanic.
2. **Electronics System Design & Manufacturing (ESDM)**: SMT Operator, Semiconductor Assembly Tech vs. Manual Soldering.
3. **Healthcare & Allied Services**: Emergency Medical Tech (EMT), Dialysis & Geriatric Care vs. Uncertified Attendants.
4. **IT-ITeS & Digital Services**: Cloud Ops, AI Annotation & Drone Piloting vs. Basic Data Entry Operators.

---

## 📊 Forecasting Horizon
- **12-Month Tactical Horizon (Monthly/Quarterly)**: For PMKVY short-term batches, District Rozgar Melas, and active apprenticeships.
- **24-Month Strategic Horizon (Quarterly/Bi-annual)**: For ITI trade affiliations, NCVET qualification packs, and capital expenditure sanctions.

---

## 📐 Data Strategy
- **40% Official Ground Truth**: MoLE NCO-2015 Taxonomies, NCVET NSQF Levels 1-8, LGD District/State Master, DPIIT Industrial Capex, NCS Sample Postings.
- **60% Statistically Calibrated Synthetic Data**: Modeled rigorously on published PLFS informal ratios and DGT capacity norms to comply with DPDP privacy laws while remaining 100% plug-and-play for live MSDE databases.

---

## 🚀 Quickstart & Running the Backend

### 1. Start the Live Backend Server
```bash
python run.py
```
* **API Server**: `http://127.0.0.1:8000`
* **Interactive Swagger UI**: `http://127.0.0.1:8000/docs`
* **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`

### 2. Run Comprehensive Automated Test Suite
```bash
python -m pytest -v
```
*(All 17 integration and unit tests passing 100%)*

---

## 🔌 API Endpoints Reference

### 1. Taxonomy & AI Classification
* `GET /api/v1/taxonomy/states`: All states with capital and codes.
* `GET /api/v1/taxonomy/districts`: Districts with official LGD codes and coordinates.
* `GET /api/v1/taxonomy/sectors`: 4 pilot sectors with Sector Skill Council (SSC) references.
* `GET /api/v1/taxonomy/occupations`: NCO-2015 trades with NSQF levels and core competencies.
* `POST /api/v1/taxonomy/match-job`: **AI Semantic NCO Mapper** (converts raw job descriptions to NCO 4/8-digit codes & NSQF level via vector similarity).

### 2. Multi-Source Demand (CDI) & Training Supply
* `GET /api/v1/demand/signals`: Granular job postings time-series.
* `GET /api/v1/demand/capex`: Leading indicator industrial capex & PLI projects.
* `GET /api/v1/demand/cdi`: **Composite Demand Index (CDI)** breakdown (Postings 30%, Capex 35%, Velocity 15%, Wages 10%, Mobility 10%).
* `GET /api/v1/supply/centers`: ITIs, PMKKs, and NSTIs across districts.
* `GET /api/v1/supply/effective`: **Effective Local Supply** discounted by passout completion, retention, and migration.

### 3. Forecasting Engine (12M & 24M Horizons)
* `GET /api/v1/forecasting/trajectory`: Forward monthly demand-supply projections with statistical confidence bands ($P_{10}$, $P_{50}$, $P_{90}$) and executive recommendations.

### 4. Diagnostic & Early Warnings
* `GET /api/v1/mismatch/dashboard`: Red/Orange early warning alerts, Top 10 shortage/surplus rankings, and geographic heatmaps.
* `GET /api/v1/mismatch/district/{district_code}`: Deep district drill-down.

### 5. Winning Pillar 2: Skill Adjacency & Bridge Courses
* `GET /api/v1/skills/bridge-recommendations`: Computes shortest skill distance from saturated legacy trades to emerging trades and recommends 4–8 week bridge courses.
* `GET /api/v1/skills/network`: Node and edge network topology for frontend visualization.

### 6. Winning Pillar 3: Policy Optimizer & What-If Sandbox
* `POST /api/v1/simulation/what-if`: Interactive sensitivity testing of capex injections, seat expansions, and stipend boosts over 12M/24M.
* `POST /api/v1/optimizer/optimize`: **Autonomous Annual Seat Allocation Optimizer** (Constrained optimization with budget limits and $\pm 20\%$ delta bounds).
* `GET /api/v1/exports/sanction-plan-csv`: Downloadable official annual training target sanction sheet for MSDE officers.
* `GET /api/v1/exports/executive-policy-brief`: Executive summary for Ministry leadership.

### 7. Winning Feature 1: NCVET Curriculum Obsolescence & Skill Drift
* `GET /api/v1/curriculum/audit/{nco_code}`: Deep curriculum obsolescence audit (alignment score %, decaying modules, missing skills, lab equipment gaps).
* `GET /api/v1/curriculum/high-risk-trades`: National prioritization ranking of trades with highest syllabus obsolescence.
* `POST /api/v1/curriculum/generate-revision-addendum`: One-click generation of official NCVET Revision Addendum & Lab Upgrade Memo.

### 8. Winning Feature 2: Inter-District Spatial Labour Mobility & Gravity Corridors
* `GET /api/v1/mobility/corridors`: Identifies the top natural talent migration corridors linking surplus feeder districts to shortage industrial hubs via spatial gravity modeling.
* `POST /api/v1/mobility/simulate-relocation-policy`: Simulates the fiscal ROI, net government savings, and shortage mitigation achieved by an MSDE Relocation Voucher Scheme.

### 9. Ground-Reality Innovation 1: Forward-Predictive Tenders (GeM / CPPP)
* `POST /api/v1/tenders/parse-and-extract-boq`: Parses GeM & CPPP approved tender scopes, translates them into a **"Bill of Qualifications" (BoQ)**, and gives MSDE a **6–12 month lead-time window** before hiring begins.
* `GET /api/v1/tenders/pipeline`: Active national pipeline of sanctioned infrastructure projects.

### 10. Ground-Reality Innovation 2: Informal Sector Proxy via Material Consumption
* `GET /api/v1/proxies/material-consumption`: Tracks wholesale cement, TMT steel, lithium battery imports, and solar panel sales at the district level to predict unorganized informal workforce demand without formal job ads.

### 11. Ground-Reality Innovation 3: "Lego-Block" Micro-Credential Pivots
* `GET /api/v1/lego/pivot-recommendation`: Stacks hyper-specific 30–45 hour modular NSQF micro-credentials onto existing training centers when oversupply is detected, reusing 85%+ center infrastructure.

### 12. Ground-Reality Innovation 4: WhatsApp "Gig-Signal" Engine for MSMEs
* `POST /api/v1/whatsapp/ingest-gig-signal`: Enables local contractors to send natural language voice notes or text requirements; extracts hiring demand and immediately returns verified certified candidates from the MSDE registry.

### 13. Ground-Reality Innovation 5: Migration-Reversal Heatmaps (IRCTC + e-Shram)
* `GET /api/v1/migration-heatmaps/railway-transit-flows`: Cross-references e-Shram profiles with anonymized IRCTC unreserved passenger movements to detect real-time workforce departures from industrial hubs back to home states.

### 14. Strategic Innovation 6: PM Gati-Shakti Multi-Modal Infrastructure Catchment
* `GET /api/v1/gati-shakti/corridors`: National GIS database of Dedicated Freight Corridors (DFCs), Multi-Modal Logistics Parks (MMLPs), and Expressway logistics anchors.
* `GET /api/v1/gati-shakti/catchment-audit`: Audits ITI readiness, lab equipment shortfalls, and capex requirements across a 50km spatial buffer radius around mega-infrastructure nodes.
* `POST /api/v1/gati-shakti/simulate-corridor-expansion`: Simulates derived logistics workforce requirements (Reach-truck operators, Cold-chain reefer technicians, Drone yard inspectors) for new capex projects.

### 15. Strategic Innovation 7: AI Automation & Skill-Obsolescence Radar
* `GET /api/v1/obsolescence/trade-risk-matrix`: Ranks NCO occupations by **Obsolescence Velocity Score (OVS, 0–100%)** based on Generative AI, RPA, and robotic penetration.
* `GET /api/v1/obsolescence/district-vulnerability`: District-wide early warning audit assessing headcount at imminent automation displacement risk within 12–18 months.
* `POST /api/v1/obsolescence/generate-preemptive-pathway`: Turn-key modular reskilling pathways providing pre-emptive immunity pivots before retrenchment occurs.

### 16. Strategic Innovation 8: CSR & Private Capex "Skill-Bounty" Co-Investment Matchmaker
* `GET /api/v1/csr/opportunities`: High-ROI match pipeline pairing corporate Section 135 (2% CSR) funds with high-deficit district trades and captive hiring commitments.
* `POST /api/v1/csr/generate-bankable-dpr`: Auto-generates a ready-to-sign tri-partite Detailed Project Report (DPR) and co-investment term sheet with verified Social Return on Investment (SROI).
* `GET /api/v1/csr/sroi-calculator`: Dynamic mathematical calculator computing net lifetime economic wage addition generated per rupee of corporate CSR invested.

