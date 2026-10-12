from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class ForecastPoint(BaseModel):
    period: str
    projected_demand_p50: float
    projected_demand_p10: float
    projected_demand_p90: float
    projected_supply: float
    mismatch_ratio: float
    severity_flag: str
    # Multi-model forward projections
    gbr_demand: Optional[float] = None
    lstm_demand: Optional[float] = None
    arima_demand: Optional[float] = None
    shock_delta: Optional[float] = None


class TradeForecastSeries(BaseModel):
    district_code: str
    district_name: str
    nco_code: str
    trade_title: str
    sector_code: str
    horizon_months: int
    historical_points: List[ForecastPoint]
    future_points: List[ForecastPoint]
    overall_severity: str
    executive_recommendation: str
    # Executive and Audit Metrics
    peak_deficit_month: Optional[str] = None
    peak_deficit_count: Optional[int] = None
    at_risk_funds_cr: Optional[float] = None
    macro_shock_impact: Optional[Dict[str, Any]] = None
    model_metadata: Optional[Dict[str, Any]] = None
    cag_audit_hash: Optional[str] = None


class ForecastFilterRequest(BaseModel):
    district_code: Optional[str] = None
    sector_code: Optional[str] = None
    nco_code: Optional[str] = None
    horizon_months: int = 12
    granularity: str = "monthly"  # "monthly" or "quarterly"
    capex_boost_cr: float = 0.0
    inflation_rate_pct: float = 5.5
    fdi_inflow_cr: float = 0.0
    stipend_boost_pct: float = 0.0
    model_type: str = "ENSEMBLE"

