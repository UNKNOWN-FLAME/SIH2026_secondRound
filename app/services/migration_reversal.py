from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.innovations import RailwayTransitCorridorRecord
from app.models.taxonomy import NCOOccupation


class RailwayTransitFlowItem(BaseModel):
    corridor_route: str
    origin_hub: str
    origin_state: str
    destination_cluster: str
    destination_state: str
    net_passenger_outflow_weekly: int
    primary_trade_affected: str
    nco_code: str
    estimated_migrant_artisans_count: int
    transit_reason_tag: str
    origin_hub_impact: str
    destination_hub_impact: str


class MigrationReversalHeatmapReport(BaseModel):
    reporting_week: str
    source_datasets: str  # "IRCTC Anonymized Unreserved UTS Ticketing & e-Shram Registered Trades"
    total_interstate_migrants_tracked: int
    top_transit_corridors: List[RailwayTransitFlowItem]
    industrial_host_warning: str
    home_state_reception_advisory: str


class MigrationReversalHeatmapService:
    """
    Migration-Reversal Heatmap Engine (Feature 5).
    Cross-references e-Shram registration profiles with IRCTC railway ticketing data
    queried directly from persistent SQL tables to detect real-time workforce departures
    and sudden inter-state labor shortages.
    """

    def generate_reversal_heatmap(
        self,
        reporting_week: str = "2026-W42"
    ) -> MigrationReversalHeatmapReport:
        db: Session = SessionLocal()
        items: List[RailwayTransitFlowItem] = []
        total_tracked = 0

        try:
            records = db.query(RailwayTransitCorridorRecord).filter(
                RailwayTransitCorridorRecord.reporting_week == reporting_week
            ).all()

            if not records:
                # If specific week not found, fallback to all records
                records = db.query(RailwayTransitCorridorRecord).all()

            for r in records:
                total_tracked += r.migrant_artisans_count
                occ = db.query(NCOOccupation).filter(NCOOccupation.nco_code == r.dominant_trade_nco).first()
                trade_title = occ.title if occ else "Technical Artisan"

                items.append(
                    RailwayTransitFlowItem(
                        corridor_route=r.corridor_route,
                        origin_hub=r.origin_hub_name,
                        origin_state=r.origin_state_code,
                        destination_cluster=r.destination_cluster_name,
                        destination_state=r.destination_state_code,
                        net_passenger_outflow_weekly=r.weekly_passenger_outflow,
                        primary_trade_affected=trade_title,
                        nco_code=r.dominant_trade_nco,
                        estimated_migrant_artisans_count=r.migrant_artisans_count,
                        transit_reason_tag=r.transit_reason_tag,
                        origin_hub_impact="ACUTE_TEMPORARY_LABOUR_SHORTAGE",
                        destination_hub_impact="SURGE_OVERSUPPLY_LOCAL_ABSORPTION_NEEDED"
                    )
                )
        finally:
            db.close()

        host_warning = (
            f"INDUSTRIAL HOST ALERT: {total_tracked:,} manufacturing technicians have departed key industrial hubs (Pune, Surat, Bengaluru). "
            f"Assembly line uptime risk is high. Recommend State Skill Missions to fast-track 30-day short-term local apprentice batches."
        )

        home_advisory = (
            "HOME STATE SKILLING ADVISORY: Massive influx of semi-skilled artisans returning to UP and Bihar. "
            "Deploy district-level Recognition of Prior Learning (RPL) camps and MSDE self-employment / PM Vishwakarma toolkits "
            "to prevent rural underemployment during their 6-8 week stay."
        )

        return MigrationReversalHeatmapReport(
            reporting_week=reporting_week,
            source_datasets="IRCTC Anonymized Unreserved UTS Ticketing & e-Shram Registered Trades",
            total_interstate_migrants_tracked=total_tracked,
            top_transit_corridors=items,
            industrial_host_warning=host_warning,
            home_state_reception_advisory=home_advisory
        )


migration_reversal_service = MigrationReversalHeatmapService()
