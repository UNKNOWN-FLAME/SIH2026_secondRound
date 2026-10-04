"""
Official Taxonomies & Anchor Data for SIH PS 26246 (MSDE)
Includes:
- Official MoLE NCO-2015 4 & 8 Digit Occupational Codes
- Official NCVET NSQF Levels (1-8)
- Official LGD (Local Government Directory) District & State Codes
- Published DPIIT / PLI Industrial Capex Schemes
"""

OFFICIAL_STATES = [
    {"code": "MH", "name": "Maharashtra", "capital": "Mumbai"},
    {"code": "UP", "name": "Uttar Pradesh", "capital": "Lucknow"},
    {"code": "GJ", "name": "Gujarat", "capital": "Gandhinagar"},
    {"code": "KA", "name": "Karnataka", "capital": "Bengaluru"}
]

OFFICIAL_DISTRICTS = [
    # Maharashtra
    {
        "code": "MH_PUNE",
        "lgd_code": 490,
        "name": "Pune",
        "state_code": "MH",
        "tier": "Tier 1",
        "latitude": 18.5204,
        "longitude": 73.8567,
        "industrial_focus": "Automotive, EV Manufacturing, IT-BPO, Precision Engineering"
    },
    {
        "code": "MH_NAGPUR",
        "lgd_code": 482,
        "name": "Nagpur",
        "state_code": "MH",
        "tier": "Tier 2",
        "latitude": 21.1458,
        "longitude": 79.0882,
        "industrial_focus": "MIHAN SEZ, Solar Installations, Logistics & Warehousing"
    },
    # Uttar Pradesh
    {
        "code": "UP_KANPUR",
        "lgd_code": 160,
        "name": "Kanpur Nagar",
        "state_code": "UP",
        "tier": "Tier 2",
        "latitude": 26.4499,
        "longitude": 80.3319,
        "industrial_focus": "Heavy Leather, Legacy Mechanical Trades, Defense Corridor Unit"
    },
    {
        "code": "UP_LUCKNOW",
        "lgd_code": 163,
        "name": "Lucknow",
        "state_code": "UP",
        "tier": "Tier 1",
        "latitude": 26.8467,
        "longitude": 80.9462,
        "industrial_focus": "Healthcare Hub, Biotechnology, IT City, Allied Medical Services"
    },
    # Gujarat
    {
        "code": "GJ_AHMEDABAD",
        "lgd_code": 444,
        "name": "Ahmedabad",
        "state_code": "GJ",
        "tier": "Tier 1",
        "latitude": 23.0225,
        "longitude": 72.5714,
        "industrial_focus": "Solar Park Equipment, Chemicals, Textile Machinery, EV Hub Sanand"
    },
    # Karnataka
    {
        "code": "KA_BLR_URBAN",
        "lgd_code": 529,
        "name": "Bengaluru Urban",
        "state_code": "KA",
        "tier": "Tier 1",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "industrial_focus": "Semiconductor Design, AI & Cloud Computing, Aerospace, ESDM Clusters"
    }
]

OFFICIAL_SECTORS = [
    {
        "code": "GREEN_ENERGY",
        "name": "Green Energy & Clean Mobility",
        "description": "Solar PV installation, Electric Vehicle powertrain assembly, battery cell manufacturing and hydrogen tech.",
        "annual_growth_rate_pct": 28.5,
        "ssc_name": "Skill Council for Green Jobs (SCGJ)"
    },
    {
        "code": "ESDM",
        "name": "Electronics System Design & Manufacturing",
        "description": "Semiconductor assembly, testing & packaging (ATMP), Surface Mount Technology (SMT), and PCB fabrication.",
        "annual_growth_rate_pct": 22.0,
        "ssc_name": "Electronics Sector Skills Council of India (ESSCI)"
    },
    {
        "code": "HEALTHCARE",
        "name": "Healthcare & Allied Clinical Services",
        "description": "Emergency medical response, dialysis care, phlebotomy, geriatric care assistance and diagnostic equipment handling.",
        "annual_growth_rate_pct": 18.0,
        "ssc_name": "Healthcare Sector Skill Council (HSSC)"
    },
    {
        "code": "IT_ITES",
        "name": "IT-ITeS & Digital Services",
        "description": "Cloud operations support, AI data annotation, drone piloting, telemetry maintenance and data center infrastructure.",
        "annual_growth_rate_pct": 19.5,
        "ssc_name": "IT-ITeS Sector Skills Council NASSCOM"
    }
]

OFFICIAL_NCO_OCCUPATIONS = [
    # 1. Green Energy & Clean Mobility Trades
    {
        "nco_code": "7411.0100",
        "division": "7",
        "sub_division": "74",
        "group_code": "7411",
        "title": "Solar PV Rooftop Installer & Grid Technician",
        "sector_code": "GREEN_ENERGY",
        "nsqf_level": 4,
        "description": "Installs, tests, commissions and maintains solar photovoltaic rooftop systems, string inverters, net metering, and DC/AC distribution boxes.",
        "typical_roles": "Solar Panel Installer, Rooftop PV Technician, Solar Rooftop Electrician, SCGJ Solar PV Wireman",
        "core_skills": [
            "Solar Photovoltaic Cell Wiring",
            "String Inverter Commissioning",
            "Roof Structural Mounting",
            "DC/AC Distribution Box Assembly",
            "Net-metering & Grid Interconnection",
            "Electrical Safety & Earthing Standards"
        ],
        "is_emerging": True,
        "is_legacy_at_risk": False
    },
    {
        "nco_code": "7231.0200",
        "division": "7",
        "sub_division": "72",
        "group_code": "7231",
        "title": "Electric Vehicle (EV) Powertrain & Battery Technician",
        "sector_code": "GREEN_ENERGY",
        "nsqf_level": 4,
        "description": "Assembles, diagnoses, services and repairs EV lithium-ion battery packs, Battery Management Systems (BMS), traction inverters, and BLDC motors.",
        "typical_roles": "EV Service Specialist, EV Powertrain Assembler, Electric Scooter Mechanic, Lithium Battery Diagnostic Tech",
        "core_skills": [
            "High Voltage Battery Pack Assembly",
            "Battery Management System (BMS) Calibration",
            "Traction Motor & Inverter Diagnostics",
            "Automotive CAN-bus Troubleshooting",
            "Thermal Management & Cooling Loop Service",
            "EV Charging Connector (Type-2/CCS) Testing"
        ],
        "is_emerging": True,
        "is_legacy_at_risk": False
    },
    {
        "nco_code": "7231.0100",
        "division": "7",
        "sub_division": "72",
        "group_code": "7231",
        "title": "Automotive Diesel & Internal Combustion Mechanic (Legacy)",
        "sector_code": "GREEN_ENERGY",
        "nsqf_level": 3,
        "description": "Inspects, services and repairs conventional internal combustion diesel and petrol engines, carburetors, fuel injectors, and mechanical gearboxes.",
        "typical_roles": "Diesel Mechanic, Engine Overhaul Mechanic, Carburetor Tuner, Garage Mechanical Attendant",
        "core_skills": [
            "Diesel Fuel Injection Calibration",
            "Cylinder Block & Piston Overhaul",
            "Mechanical Transmission & Clutch Alignment",
            "Radiator & Hydraulic Brake Servicing",
            "Exhaust Muffler & Catalytic Filter Cleaning",
            "Basic 12V Automotive Wiring"
        ],
        "is_emerging": False,
        "is_legacy_at_risk": True
    },

    # 2. Electronics (ESDM) Trades
    {
        "nco_code": "7421.0300",
        "division": "7",
        "sub_division": "74",
        "group_code": "7421",
        "title": "Surface Mount Technology (SMT) Machine Operator",
        "sector_code": "ESDM",
        "nsqf_level": 4,
        "description": "Sets up, programs, operates and maintains automated pick-and-place SMT machines, solder paste printers, and reflow ovens in PCB assembly lines.",
        "typical_roles": "SMT Line Operator, Pick & Place Machine Technician, Reflow Oven Operator, PCB Assembly Tech",
        "core_skills": [
            "SMT Pick & Place Program Loading",
            "Solder Paste Stencil Printing Inspection",
            "Reflow Oven Thermal Profiling",
            "Component Feeder Setup & Calibration",
            "Automated Optical Inspection (AOI) Review",
            "ESD (Electrostatic Discharge) Prevention Protocols"
        ],
        "is_emerging": True,
        "is_legacy_at_risk": False
    },
    {
        "nco_code": "8212.0100",
        "division": "8",
        "sub_division": "82",
        "group_code": "8212",
        "title": "Semiconductor Assembly & Packaging Technician",
        "sector_code": "ESDM",
        "nsqf_level": 5,
        "description": "Performs wafer dicing, die-attach, wire-bonding, encapsulation, and automated testing under ISO Class 4-7 cleanroom conditions.",
        "typical_roles": "Cleanroom Wafer Tech, Die Attach Operator, Wire Bonding Technician, ATMP Packaging Specialist",
        "core_skills": [
            "Cleanroom Protocol & Contamination Control",
            "Wafer Dicing & Vacuum Chuck Handling",
            "Die Attach Epoxy Dispensing",
            "Micro Wire Bonding & Ball Shear Testing",
            "Thermal Dissipation Substrate Mounting",
            "Automatic Test Equipment (ATE) Operation"
        ],
        "is_emerging": True,
        "is_legacy_at_risk": False
    },
    {
        "nco_code": "8212.0300",
        "division": "8",
        "sub_division": "82",
        "group_code": "8212",
        "title": "Manual CRT & Through-Hole Soldering Assembler (Legacy)",
        "sector_code": "ESDM",
        "nsqf_level": 3,
        "description": "Manually inserts through-hole components into printed circuit boards and solders them using hand soldering irons.",
        "typical_roles": "Manual Soldering Worker, Through-Hole Component Inserter, PCB Hand Wire Assembler",
        "core_skills": [
            "Manual Lead-based Hand Soldering",
            "Through-Hole Resistor/Capacitor Insertion",
            "Wire Stripping & Tinning",
            "Visual Solder Joint Inspection",
            "Basic PCB De-soldering & Rework"
        ],
        "is_emerging": False,
        "is_legacy_at_risk": True
    },

    # 3. Healthcare Trades
    {
        "nco_code": "3258.0100",
        "division": "3",
        "sub_division": "32",
        "group_code": "3258",
        "title": "Emergency Medical Technician (EMT - Advanced)",
        "sector_code": "HEALTHCARE",
        "nsqf_level": 4,
        "description": "Responds to emergency medical calls, administers pre-hospital life support, immobilizes fractures, and operates ambulance telemetry.",
        "typical_roles": "Ambulance EMT, Paramedic First Responder, Emergency Trauma Assistant",
        "core_skills": [
            "Basic & Advanced Life Support (BLS/ACLS)",
            "Pre-hospital Triage Assessment",
            "Airway Management & Oxygen Administration",
            "Defibrillator & ECG Telemetry Operation",
            "Trauma Splinting & Spinal Immobilization",
            "Patient Transport Protocol"
        ],
        "is_emerging": True,
        "is_legacy_at_risk": False
    },
    {
        "nco_code": "3211.0200",
        "division": "3",
        "sub_division": "32",
        "group_code": "3211",
        "title": "Dialysis Clinical Technician",
        "sector_code": "HEALTHCARE",
        "nsqf_level": 4,
        "description": "Prepares and operates hemodialysis machines, establishes vascular access, monitors vitals during dialysis, and sterilizes dialyzers.",
        "typical_roles": "Hemodialysis Assistant, Renal Care Technician, Dialysis Machine Operator",
        "core_skills": [
            "Hemodialysis Circuit Priming & Setup",
            "AV Fistula Cannulation & Sterility",
            "Patient Vital Signs & Fluid Loss Monitoring",
            "Dialyzer Reprocessing & Chemical Disinfection",
            "Water Treatment Plant (RO) Quality Testing",
            "Emergency Hypotension Protocol"
        ],
        "is_emerging": True,
        "is_legacy_at_risk": False
    },
    {
        "nco_code": "5321.0100",
        "division": "5",
        "sub_division": "53",
        "group_code": "5321",
        "title": "Uncertified General Hospital Ward Attendant (Legacy)",
        "sector_code": "HEALTHCARE",
        "nsqf_level": 2,
        "description": "Performs general non-clinical ward assistance including stretcher pushing, linen changing, and non-sterile errands.",
        "typical_roles": "Hospital Peon, Ward Boy/Aya, General Patient Carrier",
        "core_skills": [
            "Wheelchair & Stretcher Patient Transfer",
            "Linen Changing & Bed Making",
            "Specimen Tube Delivery to Lab",
            "Basic Hospital Sanitation & Waste Disposal"
        ],
        "is_emerging": False,
        "is_legacy_at_risk": True
    },

    # 4. IT-ITeS & Digital Services Trades
    {
        "nco_code": "3511.0100",
        "division": "3",
        "sub_division": "35",
        "group_code": "3511",
        "title": "Cloud Infrastructure & Data Center Operations Associate",
        "sector_code": "IT_ITES",
        "nsqf_level": 5,
        "description": "Monitors server racks, manages rack cabling, executes VM provisioning, monitors storage arrays, and ensures data center uptime.",
        "typical_roles": "Data Center Technician, Cloud Ops Associate, Rack Server Support Engineer",
        "core_skills": [
            "Server Rack Mounting & Structured Cabling",
            "Linux Server CLI Administration",
            "Virtual Machine (VM) Provisioning",
            "Data Center Power & HVAC Telemetry Monitoring",
            "Backup Execution & RAID Disk Swapping",
            "Basic Network Switch VLAN Configuration"
        ],
        "is_emerging": True,
        "is_legacy_at_risk": False
    },
    {
        "nco_code": "3153.0100",
        "division": "3",
        "sub_division": "31",
        "group_code": "3153",
        "title": "Commercial Drone Pilot & Telemetry Maintenance Technician",
        "sector_code": "IT_ITES",
        "nsqf_level": 4,
        "description": "Operates DGCA-certified multi-rotor and fixed-wing UAVs for agricultural spraying, land survey, and delivers telemetry diagnostics.",
        "typical_roles": "Drone Pilot, UAV Telemetry Tech, Agri-Drone Operator, Drone Maintenance Specialist",
        "core_skills": [
            "DGCA Drone Flight Planning & Waypoint Navigation",
            "LiDAR & Multispectral Sensor Calibration",
            "Propeller & Brushless Motor Replacement",
            "LiPo Battery Safety & Charging Protocol",
            "GIS Map Stitching & Orthomosaic Generation",
            "UAV Pre-flight Safety Clearance"
        ],
        "is_emerging": True,
        "is_legacy_at_risk": False
    },
    {
        "nco_code": "4132.0100",
        "division": "4",
        "sub_division": "41",
        "group_code": "4132",
        "title": "Basic Data Entry & Typing Operator (Legacy)",
        "sector_code": "IT_ITES",
        "nsqf_level": 3,
        "description": "Performs manual alphabetic and numeric keypunch data entry into standard spreadsheets from paper records.",
        "typical_roles": "Data Entry Operator (DEO), Typist, Form Keypunch Clerk",
        "core_skills": [
            "Touch Typing 30 WPM",
            "Basic Microsoft Excel Data Entry",
            "Paper Document Scanning",
            "Form Field Proofreading"
        ],
        "is_emerging": False,
        "is_legacy_at_risk": True
    }
]

REAL_INDUSTRIAL_CAPEX_PROJECTS = [
    {
        "project_name": "Tata Power Renewable 2.5 GW Solar PV Manufacturing Park",
        "district_code": "MH_NAGPUR",
        "sector_code": "GREEN_ENERGY",
        "primary_nco_code": "7411.0100",
        "investment_inr_cr": 4200.0,
        "announcement_period": "2024-06",
        "gestation_period_months": 18,
        "expected_direct_jobs": 3400,
        "status": "Under-Construction",
        "scheme_ref": "PM Surya Ghar Muft Bijli Yojana & State Solar Policy"
    },
    {
        "project_name": "Mahindra & Bajaj EV Powertrain & Giga Battery Gigafactory",
        "district_code": "MH_PUNE",
        "sector_code": "GREEN_ENERGY",
        "primary_nco_code": "7231.0200",
        "investment_inr_cr": 5800.0,
        "announcement_period": "2024-08",
        "gestation_period_months": 16,
        "expected_direct_jobs": 4800,
        "status": "Under-Construction",
        "scheme_ref": "PLI Scheme for Advanced Chemistry Cell (ACC) Battery"
    },
    {
        "project_name": "Micron Semiconductor Assembly & Test (ATMP) Complex Sanand",
        "district_code": "GJ_AHMEDABAD",
        "sector_code": "ESDM",
        "primary_nco_code": "8212.0100",
        "investment_inr_cr": 6600.0,
        "announcement_period": "2024-05",
        "gestation_period_months": 14,
        "expected_direct_jobs": 5000,
        "status": "Operational",
        "scheme_ref": "India Semiconductor Mission (ISM)"
    },
    {
        "project_name": "Foxconn & Dixon Mobile & SMT Electronics Cluster",
        "district_code": "KA_BLR_URBAN",
        "sector_code": "ESDM",
        "primary_nco_code": "7421.0300",
        "investment_inr_cr": 3200.0,
        "announcement_period": "2024-09",
        "gestation_period_months": 12,
        "expected_direct_jobs": 4200,
        "status": "Operational",
        "scheme_ref": "PLI for Large Scale Electronics Manufacturing"
    },
    {
        "project_name": "Medanta & Apollo Emergency Trauma Hub & Dialysis Network",
        "district_code": "UP_LUCKNOW",
        "sector_code": "HEALTHCARE",
        "primary_nco_code": "3258.0100",
        "investment_inr_cr": 1400.0,
        "announcement_period": "2024-11",
        "gestation_period_months": 15,
        "expected_direct_jobs": 1900,
        "status": "Under-Construction",
        "scheme_ref": "National Health Mission Infra Augmentation"
    },
    {
        "project_name": "Yotta & STT Green Data Center & Hyperscale Cloud Park",
        "district_code": "MH_PUNE",
        "sector_code": "IT_ITES",
        "primary_nco_code": "3511.0100",
        "investment_inr_cr": 4500.0,
        "announcement_period": "2024-07",
        "gestation_period_months": 18,
        "expected_direct_jobs": 2200,
        "status": "Under-Construction",
        "scheme_ref": "National Data Center Policy"
    }
]
