# MSDE LMIS: Software Planning & Sovereign Security Architecture

---

## PART 1: SOFTWARE PLANNING & SYSTEM ARCHITECTURE

### 1. The 3-Tier Sovereign Hierarchy & Least-Privilege Access (RBAC)

The software is structured strictly around India's constitutional administrative governance model with Role-Based Access Control (RBAC):

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TIER 1: NATIONAL LEVEL (MSDE / CABINET)              │
│  • Visual: All-India Choropleth Heatmap (Divided by States)            │
│  • Scope: Sovereign Oversight, Inter-State Balancing, Macro Capex      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Click State / Drill-Down)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│              TIER 2: STATE LEVEL (STATE SKILL MISSIONS - SSDM)         │
│  • Visual: Single State Boundary Map (Divided by Districts)            │
│  • Scope: State Quota Allocation, Inter-District Relocation Corridors  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Click District / Drill-Down)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│           TIER 3: DISTRICT LEVEL (DISTRICT COLLECTORS / DSC / ITI)      │
│  • Visual: Single District Map with Local Clusters & ITIs              │
│  • Scope: Center-Level Seat Sanctions, Local Industrial Tie-ups        │
└────────────────────────────────────────────────────────────────────────┘
```

* **Least-Privilege Enforcement:**
  * District users (e.g., Pune) can **only** read and manage Pune's LGD boundary.
  * State users (e.g., Maharashtra) can **only** view their state's 36 districts.
  * National planners have full sovereign visibility with seamless drill-down capability.

---

### 2. Universal Dropdown & Heatmap Mechanics (Dashboard Core)

1. **The Universal Sector / Trade Selector:**
   * A single master dropdown on top of the dashboard: `[ Select Sector / Trade ▼ ]` (e.g., *EV Powertrain*, *Solar PV*, *Semiconductor SMT*, *Legacy Diesel Mechanic*).
2. **Dynamic Heatmap Severity Indicators:**
   * **Acute Shortage ($Ratio \ge 1.60$):** High industry demand, critical lack of trained youth.
   * **Balanced ($0.80 \le Ratio < 1.25$):** Healthy supply-demand equilibrium.
   * **Chronic Saturation ($Ratio < 0.50$):** Severe oversupply; public funds are leaking into obsolete courses.
3. **Selection States:**
   * **Default (No Region Selected):** Shows aggregated KPIs and summary alerts for the entire jurisdiction.
   * **Region Clicked (State or District):** Scopes the entire dashboard (KPI cards, alerts, supply-demand curves) to that specific geographic boundary.
4. **Severity Diagnostic Explainability Modal:**
   * Clicking any acute shortage or saturated region opens an instant popup showing the exact analytical evidence:
     * *Incoming Capex / Tenders:* e.g., ₹1,300 Cr Tata EV plant + 500 tender wiremen required.
     * *Current ITI Capacity:* Only 120 seats available annually.
     * *Calculated Deficit:* 880 seats required.
5. **Interactive Breadcrumb Navigation:**
   * `All India > Maharashtra > Pune District` allows 1-click upward navigation.

---

### 3. The 5 Consolidated Master Pages

```
┌────────────────────────────────────────────────────────────────────────┐
│                           5 MASTER PAGES LAYOUT                        │
├───────────┬────────────────────────────────────────────────────────────┤
│ PAGE 1    │ Executive Command Dashboard (Interactive Map + Heatmap)    │
├───────────┼────────────────────────────────────────────────────────────┤
│ PAGE 2    │ Multi-Source Data & Truth Hub (CDI + Ghost Filter + Export)│
├───────────┼────────────────────────────────────────────────────────────┤
│ PAGE 3    │ AI Forecasting Engine (12M/24M Curves + Macro Shocks)      │
├───────────┼────────────────────────────────────────────────────────────┤
│ PAGE 4    │ Policy Sandbox & What-If Simulator (Capex Sliders)         │
├───────────┼────────────────────────────────────────────────────────────┤
│ PAGE 5    │ Skill Bridge & Career Transition Graph (Neo4j Ontology)    │
└───────────┴────────────────────────────────────────────────────────────┘
```

#### Page 1: Executive Command Dashboard
* 3-Tier Interactive Map (Choropleth Heatmap).
* Universal Sector/Trade dropdown.
* Dynamic KPI Cards (Projected Demand, Active ITI Capacity, Net Deficit, At-Risk Funds).
* Early-Warning Priority Alert Queue (Critical Shortage & Saturation notifications).
* Click-to-Open Severity Diagnostic Modal.

#### Page 2: Multi-Source Data & Truth Hub (CDI Engine)
* Unified view of raw data ingested from:
  * **NCS & Job Portals** (Hiring demand)
  * **GeM / CPPP Forward Tenders** (Bill of Quantities - BoQ)
  * **e-Shram** (Unorganized worker mobility)
  * **Industrial Capex / PLI** (Factory announcements)
* **Ghost & Duplicate Vacancy Filter:** Visual counter separating raw scraped ads from AI-verified, deduplicated ground demand.
* Searchable table mapped by official NCO-2015 codes.
* **1-Click Official Export:** Prominent button to download the Annual Seat Sanction Circular (CSV/PDF).

#### Page 3: AI Forecasting Engine (12M & 24M Predictive Horizon)
* Multi-model time-series curves (ARIMA, LSTM, Gradient Boosting).
* Confidence interval envelopes: **P10 (Conservative)**, **P50 (Expected)**, **P90 (Aggressive)**.
* Macro-economic shock sliders (Inflation, FDI inflows, State Capex boosts) showing real-time forecast curve shifts.

#### Page 4: Policy Sandbox & What-If Simulator
* Interactive policy parameter sliders:
  * *Industrial Capex Injection (₹ Cr)*
  * *Additional Seats Sanctioned*
  * *Trainee Stipend Boost (%)*
* Real-time recalculation of local job absorption and migration pull.
* **Before vs. After Comparison Card:** Contrasts traditional guesswork allocation against AI-optimized allocation, displaying total public funds saved.

#### Page 5: Skill Bridge & Career Transition Graph (Neo4j)
* Node-network graph visualizing competency overlap between trades.
* **30-Day Modular Bridge Recommender:**
  * Takes a saturated trade (e.g., *Automotive Diesel Mechanic - NCO 7231.0100*).
  * Maps it to a high-demand emerging trade (e.g., *EV Battery Technician - NCO 7231.0200*).
  * Identifies 78% competency overlap and generates a 4-week bridge curriculum addendum—eliminating the need to build new institutes.

---

## PART 2: SOVEREIGN SECURITY & FRAUD-PROOFING ARCHITECTURE

```
┌────────────────────────────────────────────────────────────────────────┐
│                     THE 4 SOVEREIGN SECURITY PILLARS                   │
├──────────────────────────┬─────────────────────────────────────────────┤
│ 1. ANTI-SUBSIDY GAMING   │ • Prunes bot postings & multi-portal spam   │
│    (Data Integrity)      │ • Blocks fraudulent ITI funding inflation   │
├──────────────────────────┼─────────────────────────────────────────────┤
│ 2. DPDP ACT 2023         │ • Aadhaar & Phone tokenization (SHA-256)    │
│    (Citizen Privacy)     │ • Differential privacy on e-Shram pool      │
├──────────────────────────┼─────────────────────────────────────────────┤
│ 3. ECONOMIC DEFENSE      │ • Encrypted pre-sanction tenders & capex    │
│    (Anti-Insider Trading)│ • Prevents land lobbying by private cartels │
├──────────────────────────┼─────────────────────────────────────────────┤
│ 4. CAG-READY AUDIT       │ • 3-Tier JWT Least-Privilege RBAC           │
│    (Governance Audit)    │ • Tamper-evident immutable audit logs       │
└──────────────────────────┴─────────────────────────────────────────────┘
```

### Pillar 1: Anti-Subsidy Gaming & Fake Vacancy Detection (Data Integrity)
* **The Vulnerability:** Historically in vocational schemes (e.g., PMKVY), unscrupulous private training partners inflated course enrollment numbers to siphon government training subsidies. If the AI relies on raw job portal numbers, bad actors can deploy bots to generate thousands of fake job openings on portals to artificially spike demand for their courses.
* **The Software Defense:**
  * **Entity Resolution Engine:** Clusters job postings across portals (NCS, Naukri, Apna, WorkIndia) by Employer GSTIN, corporate email domain, salary range, and posting velocity.
  * **Ghost Filtering:** Eliminates stale, perpetually unclosed openings (>90 days) and bot clusters before data reaches the Composite Demand Index (CDI) calculation.

### Pillar 2: DPDP Act 2023 Compliance & Citizen PII Protection (Privacy)
* **The Vulnerability:** Ingesting millions of unorganized workers from **e-Shram** (Aadhaar-seeded) and local informal contractors via **WhatsApp** creates severe privacy risks under the Digital Personal Data Protection (DPDP) Act 2023.
* **The Software Defense:**
  * **Cryptographic Tokenization:** Phone numbers and identity numbers are hashed with salted SHA-256 at the ingestion boundary.
  * **Differential Privacy:** Reporting layers strictly aggregate data into statistical cohorts ($k$-anonymity, $k \ge 50$ workers) at the district/trade level. Zero raw citizen PII is exposed to any dashboard user.

### Pillar 3: Economic Defense & Anti-Insider Trading (Confidentiality)
* **The Vulnerability:** Forward indicators (CPWD/GeM upcoming infrastructure tenders and unannounced PLI factory allocations) are commercially sensitive. If leaked prior to official notification, private real-estate cartels and training monopolies can buy up land near proposed ITIs and corner public funds.
* **The Software Defense:**
  * **Pre-Sanction Encryption:** Draft seat allocations and forward tender signals are stored with column-level encryption (AES-256).
  * **Quarantine State:** Recommendations remain confidential until the District Collector or State Secretary applies a verifiable digital signature.

### Pillar 4: Sovereign RBAC & CAG-Ready Immutable Audit Trails (Governance)
* **The Vulnerability:** Unauthorized seat reallocation across districts, arbitrary budget overrides, or lack of accountability during Comptroller and Auditor General (CAG) government audits.
* **The Software Defense:**
  * **Cryptographically Scoped RBAC:** JWT claims enforce strict LGD geographic boundaries (`role: district_collector`, `jurisdiction: MH_PUNE`).
  * **Immutable Audit Ledger:** Every policy slider movement, preset override, and seat sanction approval logs an append-only event:
    `{user_id, timestamp, action_type, old_seats, new_seats, reason_code, cryptographic_hash}`.
  * Produces 1-click verifiable compliance reports directly formatted for CAG audits.
