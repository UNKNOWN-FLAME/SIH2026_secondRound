from fastapi import APIRouter
from app.api.v1.endpoints import (
    taxonomy,
    demand,
    supply,
    forecasting,
    mismatch,
    skill_graph,
    simulation,
    optimizer,
    curriculum,
    mobility,
    exports,
    tenders,
    proxies,
    lego,
    whatsapp,
    migration_heatmaps,
    gati_shakti,
    obsolescence,
    csr,
    auth,
    external_integrations,
    llm_chat,
    ondc
)

api_router = APIRouter()

# Core Foundations
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & RBAC"])
api_router.include_router(llm_chat.router, prefix="/sovereign-ai", tags=["LLM Policy Copilot (RAG)"])
api_router.include_router(external_integrations.router, prefix="/integrations", tags=["External Government APIs (NCS, e-Shram)"])
api_router.include_router(ondc.router, prefix="/commerce", tags=["ONDC Gig Economy Integration"])
api_router.include_router(taxonomy.router, prefix="/taxonomy", tags=["Taxonomy & NCO Classification"])
api_router.include_router(demand.router, prefix="/demand", tags=["Labour Demand & CDI"])
api_router.include_router(supply.router, prefix="/supply", tags=["Training Supply & Capacity"])
api_router.include_router(forecasting.router, prefix="/forecasting", tags=["12M & 24M Time-Series Forecasting"])
api_router.include_router(mismatch.router, prefix="/mismatch", tags=["Mismatch & Early Warnings"])

# SIH Winning Pillars
api_router.include_router(skill_graph.router, prefix="/skills", tags=["Skill Adjacency & Bridge Courses"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["What-If Policy Simulation Sandbox"])
api_router.include_router(optimizer.router, prefix="/optimizer", tags=["Autonomous Target Optimizer"])
api_router.include_router(curriculum.router, prefix="/curriculum", tags=["NCVET Curriculum Obsolescence"])
api_router.include_router(mobility.router, prefix="/mobility", tags=["Inter-District Spatial Mobility Corridors"])

# The 5 Ground-Reality Innovations
api_router.include_router(tenders.router, prefix="/tenders", tags=["Forward-Predictive Tenders (GeM/CPPP BoQ)"])
api_router.include_router(proxies.router, prefix="/proxies", tags=["Informal Material Consumption Proxies"])
api_router.include_router(lego.router, prefix="/lego", tags=["Lego-Block Micro-Credential Pivots"])
api_router.include_router(whatsapp.router, prefix="/whatsapp", tags=["WhatsApp MSME Gig-Signal Engine"])
api_router.include_router(migration_heatmaps.router, prefix="/migration-heatmaps", tags=["Migration-Reversal Heatmaps (IRCTC)"])

# High-Impact Strategic Innovations (Gati-Shakti, Obsolescence Radar, CSR Matchmaker)
api_router.include_router(gati_shakti.router, prefix="/gati-shakti", tags=["PM Gati-Shakti Infrastructure Corridors"])
api_router.include_router(obsolescence.router, prefix="/obsolescence", tags=["AI Automation & Skill-Obsolescence Radar"])
api_router.include_router(csr.router, prefix="/csr", tags=["CSR & Private Capex Co-Investment"])

# Export & Formal Circulars
api_router.include_router(exports.router, prefix="/exports", tags=["Export & Policy Sheets"])

