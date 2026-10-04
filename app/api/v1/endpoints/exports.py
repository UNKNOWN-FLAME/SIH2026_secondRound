import io
import csv
from typing import Optional
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.policy import OptimizerRequest
from app.api.v1.endpoints.optimizer import optimize_training_targets
from app.api.v1.endpoints.mismatch import get_mismatch_dashboard

router = APIRouter()


@router.get("/sanction-plan-csv")
def export_sanction_plan_csv(
    target_cycle: str = "2026-27",
    max_seat_variation_pct: float = 20.0,
    state_code: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Exports official MSDE Annual Training Sanction Sheet in CSV format.
    Plug-and-play input for scheme planning and target-setting workflows.
    """
    req = OptimizerRequest(
        target_cycle=target_cycle,
        max_seat_variation_pct=max_seat_variation_pct,
        target_state_code=state_code
    )
    result = optimize_training_targets(request=req, period="2026-03", db=db)

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Target Cycle",
        "District Code",
        "District Name",
        "NCO-2015 Code",
        "Trade Title",
        "Sector Code",
        "Current Baseline Seats",
        "Recommended Target Seats",
        "Delta Seats",
        "Delta Percentage (%)",
        "Projected Industry Demand",
        "Residual Gap Headcount",
        "Policy Action",
        "Estimated Cost (INR Lakhs)",
        "Optimization Rationale"
    ])

    for row in result.allocations:
        writer.writerow([
            result.target_cycle,
            row.district_code,
            row.district_name,
            row.nco_code,
            row.trade_title,
            row.sector_code,
            row.current_seats,
            row.recommended_seats,
            row.delta_seats,
            f"{row.delta_pct}%",
            row.projected_demand,
            row.residual_gap,
            row.action,
            row.estimated_cost_lakhs,
            row.rationale
        ])

    csv_data = output.getvalue()
    filename = f"MSDE_Sanction_Plan_{target_cycle}.csv"
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/executive-policy-brief")
def export_executive_policy_brief(
    period: str = "2026-03",
    db: Session = Depends(get_db)
):
    """
    Generates a structured Executive Labour Market Intelligence Brief
    for apex leadership (MSDE Secretary, NCVET Chairman, SSC CEOs).
    """
    dash = get_mismatch_dashboard(period=period, state_code=None, db=db)

    brief = {
        "title": "EXECUTIVE LABOUR MARKET INTELLIGENCE & SKILL FORECASTING BRIEF",
        "ministry": "Ministry of Skill Development and Entrepreneurship (MSDE)",
        "reporting_period": period,
        "executive_summary": {
            "overall_system_balance_pct": f"{dash.overall_system_balance_pct}%",
            "total_acute_shortage_headcount": dash.total_shortage_headcount,
            "total_chronic_surplus_headcount": dash.total_surplus_headcount,
            "high_priority_early_warnings_count": len(dash.active_early_warnings)
        },
        "critical_interventions_required": [
            {
                "priority": idx + 1,
                "district": itm.district_name,
                "trade": itm.trade_title,
                "nco_code": itm.nco_code,
                "deficit": itm.gap_headcount,
                "mismatch_multiplier": f"{itm.mismatch_ratio}x",
                "recommended_action": itm.alert_summary
            }
            for idx, itm in enumerate(dash.top_undersupplied_trades[:5])
        ],
        "saturation_and_reskilling_advisories": [
            {
                "priority": idx + 1,
                "district": itm.district_name,
                "trade": itm.trade_title,
                "nco_code": itm.nco_code,
                "surplus": abs(itm.gap_headcount),
                "mismatch_multiplier": f"{itm.mismatch_ratio}x",
                "recommended_action": itm.alert_summary
            }
            for idx, itm in enumerate(dash.top_oversupplied_trades[:5])
        ]
    }
    return brief
