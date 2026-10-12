import hashlib
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.geography import District
from app.models.taxonomy import NCOOccupation, Sector
from app.models.demand import CompositeDemandRecord
from app.models.supply import TradePassoutMetric
from app.schemas.forecast import ForecastPoint, TradeForecastSeries
from app.services.forecasting_engine import forecasting_engine

router = APIRouter()


@router.get("/model-metrics")
def get_forecasting_model_metrics():
    """
    Returns trained Machine Learning model evaluation metrics (R^2, MAE, RMSE, MAPE)
    and feature importances for evaluator inspection.
    """
    return forecasting_engine.get_model_metadata()


@router.get("/trajectory", response_model=TradeForecastSeries)
def get_trade_forecast_trajectory(
    district_code: str = Query(..., description="Target District Code (e.g. 'MH_PUNE', 'UP_KANPUR')"),
    nco_code: str = Query(..., description="NCO-2015 Trade Code (e.g. '7411.0100')"),
    horizon_months: int = Query(12, description="Forecasting Horizon: 12 (Tactical) or 24 (Strategic)"),
    capex_boost_cr: float = Query(0.0, description="Industrial Capex Injection in ₹ Cr"),
    inflation_rate_pct: float = Query(5.5, description="Headline Inflation rate (%)"),
    fdi_inflow_cr: float = Query(0.0, description="FDI / Mega-Project Inflow in ₹ Cr"),
    stipend_boost_pct: float = Query(0.0, description="Trainee Stipend Boost (%)"),
    model_type: str = Query("ENSEMBLE", description="Model: ENSEMBLE, GRADIENT_BOOSTING, LSTM, ARIMA"),
    db: Session = Depends(get_db)
):
    """
    Generate 12-Month or 24-Month forward-looking monthly demand-supply forecasts
    with P10, P50 (median), and P90 statistical confidence intervals,
    multi-model curves (ARIMA, LSTM, Gradient Boosting), and real-time macro-economic shocks.
    """
    if horizon_months not in [12, 24]:
        raise HTTPException(status_code=400, detail="Horizon months must be either 12 or 24.")

    district = db.query(District).filter(District.code == district_code).first()
    if not district:
        raise HTTPException(status_code=404, detail="District not found.")

    occ = db.query(NCOOccupation).filter(NCOOccupation.nco_code == nco_code).first()
    if not occ:
        raise HTTPException(status_code=404, detail="Occupation not found.")

    # 1. Fetch 24-month historical demand records
    demand_recs = (
        db.query(CompositeDemandRecord)
        .filter(CompositeDemandRecord.district_code == district_code, CompositeDemandRecord.nco_code == nco_code)
        .order_by(CompositeDemandRecord.period.asc())
        .all()
    )

    # 2. Fetch 24-month historical supply records
    supply_recs = (
        db.query(TradePassoutMetric)
        .filter(TradePassoutMetric.district_code == district_code, TradePassoutMetric.nco_code == nco_code)
        .order_by(TradePassoutMetric.period.asc())
        .all()
    )

    hist_demands = [float(r.projected_headcount_demand) for r in demand_recs]
    hist_supplies = [float(r.effective_local_supply) for r in supply_recs]

    # Build historical points
    historical_points: List[ForecastPoint] = []
    for d_rec, s_rec in zip(demand_recs, supply_recs):
        ratio = round(d_rec.projected_headcount_demand / max(s_rec.effective_local_supply, 1), 2)
        flag = "BALANCED"
        if ratio >= 1.60:
            flag = "ACUTE_SHORTAGE"
        elif ratio >= 1.25:
            flag = "MODERATE_SHORTAGE"
        elif ratio >= 0.80:
            flag = "BALANCED"
        elif ratio >= 0.50:
            flag = "MILD_SURPLUS"
        else:
            flag = "CHRONIC_SATURATION"

        historical_points.append(
            ForecastPoint(
                period=d_rec.period,
                projected_demand_p50=float(d_rec.projected_headcount_demand),
                projected_demand_p10=float(d_rec.projected_headcount_demand),
                projected_demand_p90=float(d_rec.projected_headcount_demand),
                projected_supply=float(s_rec.effective_local_supply),
                mismatch_ratio=ratio,
                severity_flag=flag,
                gbr_demand=float(d_rec.projected_headcount_demand),
                lstm_demand=float(d_rec.projected_headcount_demand),
                arima_demand=float(d_rec.projected_headcount_demand),
                shock_delta=0.0
            )
        )

    # Growth drift factor based on emerging vs legacy classification
    drift = 0.22 if occ.is_emerging else (-0.06 if occ.is_legacy_at_risk else 0.08)

    # 3. Generate forward forecast series with macro shocks and multi-model curves
    future_points = forecasting_engine.forecast_trajectory(
        historical_demands=hist_demands,
        historical_supplies=hist_supplies,
        start_year=2026,
        start_month=4,
        horizon_months=horizon_months,
        annual_growth_drift=drift,
        is_emerging=occ.is_emerging,
        is_legacy_at_risk=occ.is_legacy_at_risk,
        capex_boost_cr=capex_boost_cr,
        inflation_rate_pct=inflation_rate_pct,
        fdi_inflow_cr=fdi_inflow_cr,
        stipend_boost_pct=stipend_boost_pct,
        model_type=model_type
    )

    # Executive narrative & Deficit metrics
    last_point = future_points[-1]
    last_ratio = last_point.mismatch_ratio

    # Find peak deficit month
    deficits = [(p.period, p.projected_demand_p50 - p.projected_supply) for p in future_points]
    peak_pt = max(deficits, key=lambda x: x[1])
    peak_deficit_month = peak_pt[0] if peak_pt[1] > 0 else None
    peak_deficit_count = int(round(peak_pt[1])) if peak_pt[1] > 0 else 0

    # Calculate at-risk public funds if oversupplied/saturated
    # Average public training subsidy is ~ ₹48,000 per trainee seat annually
    surplus_seats = max(0, int(sum(max(0, p.projected_supply - p.projected_demand_p50) for p in future_points) / max(len(future_points), 1)))
    at_risk_funds_cr = round((surplus_seats * 48000) / 10000000.0, 2) if occ.is_legacy_at_risk or last_ratio <= 0.60 else 0.0

    if last_ratio >= 1.60:
        recommendation = (
            f"URGENT POLICY ACTION REQUIRED: By {last_point.period}, demand ({int(last_point.projected_demand_p50)}) "
            f"will exceed effective supply ({int(last_point.projected_supply)}) by {last_ratio}x. "
            f"MSDE should sanction an additional {int(round(last_point.projected_demand_p50 - last_point.projected_supply))} "
            f"annual training seats across local ITIs and PMKK centers to prevent industrial talent choking."
        )
    elif last_ratio <= 0.50:
        recommendation = (
            f"CAPACITY REDUCTION & RESKILLING ADVISORY: Chronic oversupply detected ({last_ratio}x demand/supply ratio). "
            f"Graduates are failing to find local placement. Freeze new seat sanctions (saving ₹{at_risk_funds_cr} Cr in public funds) "
            f"and redirect at least 50% of current batch intake into adjacent emerging bridge modules."
        )
    else:
        recommendation = (
            f"STABLE EQUILIBRIUM: Trade is projected to remain balanced ({last_ratio}x ratio). Maintain current seat quotas "
            f"while monitoring placement outcomes."
        )

    # Cryptographic Audit Verification Hash (Institutional Compliance)
    cag_str = f"{district_code}:{nco_code}:{horizon_months}:{capex_boost_cr}:{inflation_rate_pct}:{last_ratio}"
    cag_hash = hashlib.sha256(cag_str.encode()).hexdigest()[:16].upper()

    return TradeForecastSeries(
        district_code=district.code,
        district_name=district.name,
        nco_code=occ.nco_code,
        trade_title=occ.title,
        sector_code=occ.sector_code,
        horizon_months=horizon_months,
        historical_points=historical_points[-12:],  # Last 12 historical months
        future_points=future_points,
        overall_severity=last_point.severity_flag,
        executive_recommendation=recommendation,
        peak_deficit_month=peak_deficit_month,
        peak_deficit_count=peak_deficit_count,
        at_risk_funds_cr=at_risk_funds_cr,
        macro_shock_impact={
            "capex_boost_cr": capex_boost_cr,
            "inflation_rate_pct": inflation_rate_pct,
            "fdi_inflow_cr": fdi_inflow_cr,
            "stipend_boost_pct": stipend_boost_pct,
            "active_model": model_type
        },
        model_metadata=forecasting_engine.get_model_metadata(),
        cag_audit_hash=cag_hash
    )

