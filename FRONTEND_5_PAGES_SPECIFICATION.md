# 🏛️ Complete Frontend Engineering Specification: 5-Page Sovereign LMIS Architecture

**Project:** AI-Enabled Labour Market Intelligence System (LMIS)  
**Problem Statement:** PS-26246 (MSDE & NCVET)  
**Target Audience:** Front-End Engineers, AI Coding Agents, UI/UX Architects  
**Styling Paradigm:** Sovereign Executive Theme (Dark Mode, High Information Density, CSS Grid/Flexbox)  

---

## 📑 TABLE OF CONTENTS
1. [Global Layout & Shell Architecture](#1-global-layout--shell-architecture)
2. [Page 1: Executive Command Dashboard (`/`)](#2-page-1-executive-command-dashboard-)
3. [Page 2: Multi-Source Data & Truth Hub (`/data-hub`)](#3-page-2-multi-source-data--truth-hub-data-hub)
4. [Page 3: AI Forecasting Engine (`/forecasting`)](#4-page-3-ai-forecasting-engine-forecasting)
5. [Page 4: Policy Sandbox & What-If Simulator (`/sandbox`)](#5-page-4-policy-sandbox--what-if-simulator-sandbox)
6. [Page 5: Skill Bridge & Career Transition Graph (`/skill-graph`)](#6-page-5-skill-bridge--career-transition-graph-skill-graph)
7. [Global State & Cross-Page Reactive Contracts](#7-global-state--cross-page-reactive-contracts)

---

## 1. GLOBAL LAYOUT & SHELL ARCHITECTURE

### Shell Layout Grid
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ TOP HEADER (Height: 64px, Sticky, z-index: 100)                                  │
│ [🇮🇳 MSDE Emblem]  LMIS Sovereign Telemetry  |  Breadcrumb Nav  |  Role Badge     │
├──────────────┬───────────────────────────────────────────────────────────────────┤
│ SIDEBAR      │ MAIN CONTENT VIEWPORT (flex: 1, overflow-y: auto, padding: 24px)  │
│ (Width: 260px│                                                                   │
│  Fixed,      │                                                                   │
│  Collapsible)│                                                                   │
│              │                                                                   │
│ 5 Nav Items  │                                                                   │
└──────────────┴───────────────────────────────────────────────────────────────────┘
```

### Persistent Sidebar Navigation Items
1. **Command Dashboard** (`/`) — Icon: `LayoutDashboard`
2. **Data & Truth Hub** (`/data-hub`) — Icon: `Database`
3. **AI Forecasting** (`/forecasting`) — Icon: `TrendingUp`
4. **Policy Sandbox** (`/sandbox`) — Icon: `FlaskConical`
5. **Skill Bridge Graph** (`/skill-graph`) — Icon: `Network`

---

## 2. PAGE 1: EXECUTIVE COMMAND DASHBOARD (`/`)

### 2.1 Wireframe Blueprint
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [Row 0: Control Bar]                                                             │
│ Breadcrumb: All India > Maharashtra > Pune  |  Sector/Trade: [EV Battery Tech ▼] │
├──────────────────────────────────────────────────────────────────────────────────┤
│ [Row 1: Macro KPI Cards - Grid 4 Columns]                                        │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│ │Projected Dmd │  │Training Sup  │  │Net Deficit   │  │At-Risk Funds │           │
│ │20,197 (+14%) │  │11,400 Seats  │  │-8,797 (ACUTE)│  │₹4.8 Cr (SAT) │           │
│ └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘           │
├─────────────────────────────────────────┬────────────────────────────────────────┤
│ [Row 2: Main Split View (Height: 520px)]│                                        │
│ LEFT: Interactive Map (60% Width)       │ RIGHT: Priority Action Queue (40% W)   │
│                                         │                                        │
│ • GeoJSON Choropleth Map (State/Dist)   │ • Alert 1: EV Tech (Pune) [ACUTE]      │
│ • Severity Heatmap Fill Colors          │   Deficit: -880 | Action: Double Intake│
│ • Hover Tooltip: Name, Dmd, Sup, Ratio  │ • Alert 2: Solar (Nagpur) [MODERATE]   │
│ • Click: Zooms in & Filters Viewport    │   Deficit: -420 | Action: PMKK Mobile  │
│ • Click Critical Zone: Opens Modal      │ • Alert 3: Diesel Mech [SATURATION]    │
│                                         │   Surplus: +650 | Action: Freeze Intake│
├─────────────────────────────────────────┴────────────────────────────────────────┤
│ [Row 3: Bottom Analytics - Grid 2 Columns]                                       │
│ LEFT: Demand vs. Supply Gap (Grouped Bar)│ RIGHT: CDI Factor Weights (Radar/Bar)  │
├──────────────────────────────────────────────────────────────────────────────────┤
│ [Row 4: 1-Click Action Bar]                                                      │
│ [ ⚡ Jump to Sandbox ]    [ 🌉 Jump to Skill Graph ]    [ 📄 Export District Brief]│
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Specifications
1. **`ControlBar`**:
   * Dropdown: `tradeSelector` (fetches `/api/v1/taxonomy/occupations`).
   * Dropdown: `timePeriod` (Default: `2026-03`).
   * Breadcrumb: `NavigationHistory` (`level: national | state | district`).
2. **`KPIGrid`**:
   * 4 cards bound to `GET /api/v1/demand/summary` and `GET /api/v1/supply/summary`.
   * Dynamic re-fetch whenever `tradeSelector` or clicked region changes.
3. **`ChoroplethMap`**:
   * Implementation: Leaflet / SVG Vector Map with LGD Codes.
   * Color logic:
     * Severity Ratio $R = \text{Demand} / \text{Supply}$.
     * $R \ge 1.60 \rightarrow$ Acute Shortage (High severity class).
     * $0.80 \le R < 1.25 \rightarrow$ Balanced.
     * $R < 0.50 \rightarrow$ Chronic Saturation (Low severity class).
   * Event: `onRegionClick(regionCode)` $\rightarrow$ updates `activeDistrict` state.
4. **`PriorityActionQueue`**:
   * Ingests `GET /api/v1/mismatch/dashboard`.
   * Displays ranked cards: Trade Name, Severity Badge, Net Shortage, and Concrete Policy Action.
5. **`SeverityDiagnosticModal` (Popup)**:
   * Triggered when clicking a critical region or clicking "Inspect" on an alert card.
   * Contents:
     * Header: `District Diagnostic Report: Pune (MH_PUNE)`
     * Incoming Capex / Tenders line items (e.g., Tata Motors EV ₹1,300 Cr).
     * Local ITI Supply breakdown (e.g., ITI Aundh: 120 seats).
     * Net Shortage math and prescribed seat expansion.

### 2.3 Connected Backend APIs
* `GET /api/v1/taxonomy/districts` $\rightarrow$ Map boundaries and metadata.
* `GET /api/v1/taxonomy/occupations` $\rightarrow$ Master trade dropdown.
* `GET /api/v1/demand/summary?period=2026-03` $\rightarrow$ Macro demand KPI.
* `GET /api/v1/supply/summary?period=2026-03` $\rightarrow$ Macro supply KPI.
* `GET /api/v1/mismatch/dashboard?period=2026-03` $\rightarrow$ Alerts queue and severity map ratios.

---

## 3. PAGE 2: MULTI-SOURCE DATA & TRUTH HUB (`/data-hub`)

### 3.1 Wireframe Blueprint
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [Row 0: Header & Export]                                                         │
│ Title: Multi-Source Data & Truth Hub      [ 📥 Export Annual Sanction Plan (CSV)]│
├──────────────────────────────────────────────────────────────────────────────────┤
│ [Row 1: 4 Ingestion Stream Metric Cards]                                         │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│ │NCS / Portals │  │GeM Tenders   │  │Capex & PLI   │  │e-Shram Pool  │           │
│ │20,197 Ads    │  │14 Tenders/BoQ│  │₹25,700 Cr    │  │45,200 Artisans│          │
│ └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘           │
├──────────────────────────────────────────────────────────────────────────────────┤
│ [Row 2: Ghost & Duplicate Vacancy Filter Banner]                                 │
│ [ Toggle: Raw Scrapes vs. AI-Verified ]                                          │
│ 42,300 Raw ──> -16,200 Duplicates ──> -5,900 Stale Ghost ──> 20,197 Ground Truth │
│ Trust Index: 88.4% Clean Ground Signal | Entity Resolution Active                │
├──────────────────────────────────────────────────────────────────────────────────┤
│ [Row 3: Search, Filter & Master Reconciliation Table]                            │
│ [ 🔍 Search NCO/Trade... ]  [ Sector: All ▼ ]  [ District: All ▼ ]  [ Status: All]│
│ ┌───────┬─────────────────┬──────┬────────┬────────┬───────┬──────┬────────────┐ │
│ │NCO    │Trade Title      │Sector│Tenders │Postings│Demand │Supply│Mismatch/Act│ │
│ ├───────┼─────────────────┼──────┼────────┼────────┼───────┼──────┼────────────┤ │
│ │7411.01│Solar PV Install │Green │₹450 Cr │1,420   │1,108  │480   │Short (-628)│ │
│ │7231.02│EV Powertrain    │Green │₹1300 Cr│1,650   │1,261  │380   │Short (-881)│ │
│ │7231.01│Diesel Mech (Leg)│Green │₹0 Cr   │210     │320    │950   │Sat (+630)  │ │
│ └───────┴─────────────────┴──────┴────────┴────────┴───────┴──────┴────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Component Specifications
1. **`IngestionStreamCards`**:
   * Shows data freshness, source ping timestamp, and aggregate active volume across all 4 lead channels.
2. **`GhostFilterFunnelBanner`**:
   * Visual conversion funnel: Raw Count $\rightarrow$ Duplicate Count $\rightarrow$ Ghost Count $\rightarrow$ Net Verified Count.
   * Toggle button: switching to "Raw" shows how uncleaned data would mislead planners.
3. **`MasterReconciliationTable`**:
   * Columns: NCO-2015 Code, Trade Title, Sector, Tender BoQ Component, Job Postings, Projected Demand, Effective Supply, Mismatch Severity Status, Prescribed Policy Action.
   * Search input: filters by trade name or code in real-time.
4. **`ExportSanctionModal`**:
   * Triggered by `[ 📥 Export Annual Sanction Plan ]`.
   * Options: Target Financial Cycle (`2026-27`), Max Variation Constraint (`±20%`), State/District Filter.
   * Action: Calls `/api/v1/exports/sanction-plan.csv` to trigger file download.

### 3.3 Connected Backend APIs
* `GET /api/v1/demand/signals` $\rightarrow$ Raw job ads feed.
* `GET /api/v1/demand/capex` $\rightarrow$ Industrial projects list.
* `GET /api/v1/tenders/pipeline` $\rightarrow$ Ingested GeM/CPWD forward tenders.
* `GET /api/v1/demand/cdi?period=2026-03` $\rightarrow$ Composite demand table rows.
* `GET /api/v1/supply/effective?period=2026-03` $\rightarrow$ Effective supply table rows.
* `GET /api/v1/exports/sanction-plan.csv` $\rightarrow$ 1-click CSV download.

---

## 4. PAGE 3: AI FORECASTING ENGINE (`/forecasting`)

### 4.1 Wireframe Blueprint
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [Row 0: Control Header]                                                          │
│ District: [Pune ▼]   Trade: [EV Battery Tech ▼]   Horizon: [ 12M | 24M Toggle ]  │
├──────────────────────────────────────────────────────────────────────────────────┤
│ [Row 1: The Master Predictive Time-Series Chart (Height: 400px)]                 │
│                                                                                  │
│  Y: Headcount Demand (0 - 2,500)                                                 │
│                                                                                  │
│   2000 │                                            --- P90 (Upper Envelope)     │
│        │                                     ╭─────── P50 (Expected Baseline)    │
│   1000 │                     ╭───────────────╯      --- P10 (Lower Envelope)     │
│        │        ╭────────────╯                                                   │
│    500 │────────╯ [Past 24M Actuals]         [Future 12-24M Forecast Window]     │
│      0 └─────────────────────────────────────┴────────────────────────────────   │
│          Apr 2024                 Mar 2026     Apr 2026               Mar 2028   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ [Row 2: Macro-Economic Shock Sliders]                                            │
│ Slider 1: State Capex Growth Rate      [ ───●────────── ]  +15.0% YoY            │
│ Slider 2: Inflation / Material Index   [ ───────●────── ]    6.2% CPI            │
│ Slider 3: PLI Inflow Multiplier        [ ─────●──────── ]    1.2x Multiplier     │
├─────────────────────────────────────────┬────────────────────────────────────────┤
│ [Row 3: Left - Model Validation Scores] │ [Row 3: Right - Sectoral Momentum]     │
│ • MAPE: 6.4% Accuracy                   │ • Green Energy / EV:  +28.5% YoY       │
│ • RMSE: 42 Trainees                     │ • Semiconductors:     +22.0% YoY       │
│ • R² Fit Score: 0.91                    │ • Healthcare Allied:  +18.0% YoY       │
│ • Tender Lead Time: 8.2 Months (r=0.84) │ • Legacy Mechanical:  -14.2% YoY (FALL)│
└─────────────────────────────────────────┴────────────────────────────────────────┘
```

### 4.2 Component Specifications
1. **`TimeSeriesForecastChart`**:
   * Uses Recharts `ComposedChart` (`Line` + `Area` for confidence bands).
   * Solid Line: Historic calibrated ground actuals.
   * Dashed Line: Projected trajectory.
   * Shaded Area: Range between P10 and P90 confidence limits.
2. **`MacroShockSliders`**:
   * Controlled sliders bound to local state.
   * On slider drag: Applies linear elasticities to future points in real time ($Y_{new} = Y \times (1 + \Delta_{\text{capex}} \cdot 0.35)$), visually bending the curve.
3. **`ValidationMetricsScorecard`**:
   * 4 static/calculated KPI cards establishing statistical credibility (MAPE, RMSE, R², Lead correlation).
4. **`SectoralMomentumGrid`**:
   * Compact 4-card matrix displaying comparative annual growth trajectory by sector.

### 4.3 Connected Backend APIs
* `GET /api/v1/forecasting/predict/{nco_code}/{district_code}?horizon_months=24` $\rightarrow$ Historical points, projected points, and confidence bands.
* `GET /api/v1/taxonomy/sectors` $\rightarrow$ Sectoral growth benchmarks.

---

## 5. PAGE 4: POLICY SANDBOX & WHAT-IF SIMULATOR (`/sandbox`)

### 5.1 Wireframe Blueprint
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [Row 0: Header & Quick Scenario Presets]                                         │
│ Presets: [ ⚡ Tata EV Sanand ]  [ ☀️ PM Surya Ghar Solar ]  [ 🔬 Micron ATMP Fab ]│
├─────────────────────────────────────────┬────────────────────────────────────────┤
│ [Row 1: Left - Policy Parameter Sliders]│ [Row 1: Right - Live Impact Scorecard] │
│ Target District: [ Pune (MH_PUNE) ▼ ]   │ ┌──────────────────┐┌─────────────────┐│
│ Target Sector:   [ Green Energy ▼ ]     │ │Deficit Resolved  ││Local Absorption ││
│                                         │ │-881 ──> 0 BALANCED││58% ──> 89% Placed││
│ Slider 1: Capex Injection (₹ Cr)        │ └──────────────────┘└─────────────────┘│
│ [ ───────────●─── ]  ₹1,300 Cr          │ ┌──────────────────┐┌─────────────────┐│
│ Slider 2: Additional Seats Sanctioned   │ │In-Migration Pull ││Pub Funds Saved  ││
│ [ ──────●──────── ]  +1,200 Seats       │ │+340 Workers      ││₹14.8 Crores     ││
│ Slider 3: Apprentice Stipend Boost      │ └──────────────────┘└─────────────────┘│
│ [ ────●────────── ]  +20% Stipend       │                                        │
│ Slider 4: Horizon: [ 12M | 24M ]        │ Equilibrium: Supply matches 100% Demand│
│ [ ⚡ RUN DYNAMIC SIMULATION ]            │ Lead Time to Saturation: 14 Months     │
├─────────────────────────────────────────┴────────────────────────────────────────┤
│ [Row 2: "Before vs. After" Allocation Chart (Grouped Bar Chart)]                 │
│ Legacy Diesel: Old = 1,200 (Waste) ──> AI-Optimized = 250 (Phased)               │
│ EV Battery:    Old =   120 (Short) ──> AI-Optimized = 1,200 (Balanced!)          │
├──────────────────────────────────────────────────────────────────────────────────┤
│ [Row 3: Ground Center-Wise Allocation Table]                                     │
│ • Government ITI Aundh (Pune)  ──>  +400 Seats (EV Battery Pack Assembly)        │
│ • Government ITI Khed (Chakan) ──>  +500 Seats (EV Powertrain Diagnostics)       │
│ • PMKK Central Pune            ──>  +300 Seats (Charging Infra Maintenance)      │
│ [ 📋 Push Recommended Seats to Official Sanction Plan ]                          │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Component Specifications
1. **`PresetButtonBar`**:
   * Buttons pre-populating district, sector, capex, and seat inputs with 1 click.
2. **`PolicySliderPanel`**:
   * Interactive inputs for Capex (₹ Cr), Seat expansion, and Stipend subsidy (%).
   * Dispatches simulation request on click or debounced slider change.
3. **`SimulationImpactScorecard`**:
   * Displays delta shift in deficit, placement rate, inter-district migration, and net public funds saved.
4. **`BeforeAfterAllocationChart`**:
   * Visual grouped bar chart directly showing the reduction of seats in obsolete trades and reallocation to high-demand trades.
5. **`CenterSanctionTable`**:
   * Ground-level allocation breakdown showing exact ITI center names and sanctioned seat numbers.

### 5.3 Connected Backend APIs
* `GET /api/v1/simulation/presets` $\rightarrow$ Pre-configured policy scenarios.
* `POST /api/v1/simulation/what-if` $\rightarrow$ Executes constrained simulation model with request payload:
  ```json
  {
    "scenario_name": "EV Transition",
    "target_district_code": "MH_PUNE",
    "target_sector_code": "GREEN_ENERGY",
    "capex_injection_cr": 1300.0,
    "additional_seats_sanctioned": 1200,
    "training_stipend_boost_pct": 20.0,
    "simulation_horizon_months": 12
  }
  ```

---

## 6. PAGE 5: SKILL BRIDGE & CAREER TRANSITION GRAPH (`/skill-graph`)

### 6.1 Wireframe Blueprint
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [Row 0: Header & Trade Selector]                                                 │
│ Saturated Trade: [ Automotive Diesel Mechanic (NCO 7231.0100) ▼ ]                │
│ District: [ Pune (MH_PUNE) ▼ ]   |   Surplus Workers Pool: [ 800 Mechanics ]     │
├─────────────────────────────────────────┬────────────────────────────────────────┤
│ [Row 1: Left - Interactive Graph (50%)] │ [Row 1: Right - Bridge Prescription Card│
│                                         │                                        │
│          (EV Battery Tech)              │ Target Trade: EV Battery Technician    │
│                 ● [78% Overlap]         │ Overlap: 78.0% | Duration: 4 Weeks     │
│                /                        │ Cost: ₹4,200/student (vs ₹65,000 fresh)│
│               / (Thick Edge: 4 Weeks)   │                                        │
│              /                          │ SHARED SKILLS (0 Retraining Needed):   │
│  (Diesel    ●                           │ • 12V Automotive Wiring Basics         │
│  Mechanic) ───- - - ● (Solar Inverter)  │ • Hydraulic Cooling Loop Maintenance   │
│              \       [62% Overlap]      │ • Mechanical Transmission Alignment    │
│               \ (Thin Edge: 8 Weeks)    │                                        │
│                ●                        │ GAP SKILLS (To Teach in 30 Days):      │
│          (CNC Machine Tool)             │ • 400V High-Voltage Battery Safety     │
│           [54% Overlap]                 │ • BMS CAN-Bus Diagnostic Telemetry     │
│                                         │ • BLDC Traction Motor Calibration      │
├─────────────────────────────────────────┴────────────────────────────────────────┤
│ [Row 2: NCVET-Compliant 4-Week Modular Timetable Blocks]                         │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│ │WEEK 1 (30h)  │  │WEEK 2 (30h)  │  │WEEK 3 (30h)  │  │WEEK 4 (30h)            │ │
│ │HV PPE Safety │  │Li-Ion & BMS  │  │BLDC Motors   │  │Factory Apprenticeship  │ │
│ └──────────────┘  └──────────────┘  └──────────────┘  └────────────────────────┘ │
│ [ 📄 Download NCVET-Approved Modular Bridge Curriculum Addendum (PDF) ]          │
├──────────────────────────────────────────────────────────────────────────────────┤
│ [Row 3: Macro Redeployment Impact Scorecard]                                     │
│ • Workers Redeployed: 624 / 800 Mechanics  | • Time Saved: 23 Months per Youth   │
│ • ITI Equipment Reused: 86% Tools Reused  | • Net Public Fund Saved: 93% Cost    │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Component Specifications
1. **`SkillOntologyGraphViewer`**:
   * Canvas / SVG node-link graph visualization.
   * Central source node linked to adjacent target nodes.
   * Edge thickness and label reflect competency overlap percentage and recommended bridge course weeks.
   * Click event on target node updates the right-hand prescription card.
2. **`BridgePrescriptionCard`**:
   * Clear comparative breakdown of **Shared Competencies** (already mastered) vs. **Gap Competencies** (to be trained).
   * Economic yield comparison: ₹4,200 bridge cost vs. ₹65,000 new diploma cost.
3. **`ModularCurriculumTimeline`**:
   * 4 sequential weekly cards defining the exact NCVET micro-module curriculum.
   * Export button generating downloadable PDF curriculum addendum.
4. **`RedeploymentScorecard`**:
   * 4 metric tiles measuring redeployment rate, time saved, tool reuse percentage, and budget yield.

### 6.3 Connected Backend APIs
* `GET /api/v1/skills/network` $\rightarrow$ Graph topology nodes and edges.
* `GET /api/v1/skills/bridge-recommendations?source_nco_code=7231.0100&surplus_headcount=800` $\rightarrow$ Overlap percentage, shared skills, gap skills, and recommended bridge duration.
* `GET /api/v1/curriculum/addendum/7231.0200` $\rightarrow$ NCVET weekly modular syllabus.

---

## 7. GLOBAL STATE & CROSS-PAGE REACTIVE CONTRACTS

To maintain seamless synchronization when navigating across all 5 pages:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GLOBAL APPLICATION STATE                        │
├──────────────────────┬─────────────────────────────────────────────────┤
│`selectedJurisdiction`│ Scope (`national` | `state:MH` | `dist:MH_PUNE`)│
├──────────────────────┼─────────────────────────────────────────────────┤
│ `selectedTrade`      │ Global active trade NCO (e.g. `7231.0200`)      │
├──────────────────────┼─────────────────────────────────────────────────┤
│ `selectedPeriod`     │ Target operational cycle (Default: `2026-03`)   │
├──────────────────────┼─────────────────────────────────────────────────┤
│ `authClaims`         │ Scoped user permissions (`role`, `lgd_boundary`)│
└──────────────────────┴─────────────────────────────────────────────────┘
```

* **Contract 1:** Selecting a district on Page 1 (Map) persists `selectedJurisdiction`, ensuring Pages 2, 3, 4, and 5 automatically open pre-scoped to that district.
* **Contract 2:** Clicking *"Simulate Policy Intervention"* on Page 1 passes the active district and trade into Page 4's sandbox sliders.
* **Contract 3:** Clicking *"View Skill Bridge Transition"* on Page 1 opens Page 5 with the saturated trade pre-selected as the source node.
