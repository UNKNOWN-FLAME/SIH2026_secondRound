from typing import Dict, Any
from pydantic import BaseModel
import re

class PolicyChatResponse(BaseModel):
    query: str
    generated_memo: str
    confidence_score: float
    data_sources_referenced: list[str]

class SovereignLLMPolicyEngine:
    """
    Local Sovereign LLM (RAG) Engine for Policy Chat (Phase 1).
    Simulates a locally-hosted Llama-3 / Mistral model querying the MSDE database.
    In production, this utilizes LangChain and a VectorDB (Milvus) to fetch CDI context.
    """
    def __init__(self):
        self.model_name = "MSDE-Llama3-8B-Instruct-Quantized"
        
    def generate_policy_memo(self, query: str, context_data: Dict[str, Any] = None) -> PolicyChatResponse:
        """
        Takes a natural language query from a state planner and generates a policy memo.
        """
        query_lower = query.lower()
        
        # Simulated RAG Context Processing
        if "welder" in query_lower:
            district_match = re.search(r'in\s+([a-zA-Z\s]+)', query_lower)
            district = district_match.group(1).strip().title() if district_match else "Pune"
            
            memo = (
                f"**EXECUTIVE POLICY MEMO**\n"
                f"**Subject:** Intervention for TIG Welder Shortage in {district}\n\n"
                f"**Analysis (RAG Context):**\n"
                f"Recent data indicates a surge in industrial Capex in {district} (Auto & Manufacturing sectors). "
                f"Simultaneously, the Composite Demand Index (CDI) for 'Structural Bridge & Rebar Welder' (NCO 7212) "
                f"has hit 88.5/100, signaling an acute shortage.\n\n"
                f"**Recommended Action (AI Agent):**\n"
                f"1. Sanction an immediate 3-week 'Advanced TIG Welding' bridge course in {district}.\n"
                f"2. Divert surplus candidates from adjacent trades (e.g., General Fitter) using the Skill Graph Engine.\n"
                f"3. Allocate emergency mobility vouchers to relocate workers from adjacent surplus districts.\n"
                f"\n*Drafted by MSDE Sovereign AI.*"
            )
            sources = [f"CDI Engine ({district}/NCO-7212)", "Spatial Gravity Engine"]
            confidence = 0.94
            
        elif "solar" in query_lower or "renewable" in query_lower:
            district_match = re.search(r'in\s+([a-zA-Z\s]+)', query_lower)
            district = district_match.group(1).strip().title() if district_match else "Gujarat"
            
            memo = (
                f"**EXECUTIVE POLICY MEMO**\n"
                f"**Subject:** Solar PV Technician Demand Surge in {district}\n\n"
                f"**Analysis (RAG Context):**\n"
                f"NLP Tender parsing indicates a ₹450 Cr Solar Infrastructure project sanctioned in {district}. "
                f"Projected demand: 320 Solar PV Installers in the next 6 months.\n\n"
                f"**Recommended Action (AI Agent):**\n"
                f"Initiate PMKVY RPL certification camps in rural {district} to upskill local electricians."
            )
            sources = ["Tender NLP Parser (GeM/CPPP)"]
            confidence = 0.89
            
        else:
            memo = (
                "**GENERAL INQUIRY**\n"
                "The MSDE AI Engine has analyzed your query. However, no critical anomalies were detected for this specific combination in the live Kafka stream. "
                "To generate a precise econometric policy memo, please ask about a high-variance trade (e.g., Welder, Solar, EV Technician)."
            )
            sources = ["LMIS Global Context"]
            confidence = 0.65
            
        return PolicyChatResponse(
            query=query,
            generated_memo=memo,
            confidence_score=confidence,
            data_sources_referenced=sources
        )

llm_policy_engine = SovereignLLMPolicyEngine()
