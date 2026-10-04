from typing import Optional
from fastapi import APIRouter, Query
from app.services.migration_reversal import migration_reversal_service, MigrationReversalHeatmapReport

router = APIRouter()


@router.get("/railway-transit-flows", response_model=MigrationReversalHeatmapReport)
def get_migration_reversal_heatmap(
    reporting_week: str = Query("2026-W42", description="Calendar ISO week (e.g. 2026-W42 for Diwali/Chhath season)")
):
    """
    Migration-Reversal Heatmap Engine (Feature 5).
    Cross-references e-Shram database with anonymized IRCTC unreserved ticketing data
    to detect real-time workforce departures from industrial hubs back to home states.
    Triggers 'Acute Shortage' warnings for factories and 'High Oversupply' warnings for home states.
    """
    return migration_reversal_service.generate_reversal_heatmap(reporting_week=reporting_week)
