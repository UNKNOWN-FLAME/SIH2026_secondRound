import math
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.geography import District
from app.models.taxonomy import NCOOccupation, Sector
from app.models.demand import JobPostingSignal, IndustrialCapexSignal, LaborMigrationSignal, CompositeDemandRecord
from app.models.supply import TradePassoutMetric


def extract_training_dataset(db: Session = None) -> pd.DataFrame:
    """
    Extracts tabular panel data across districts, trades, and 24 monthly periods.
    Engineers temporal lags, rolling statistics, capex gestation, and cyclical seasonality.
    """
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    # 1. Fetch Composite Demand Records joined with Geography and Taxonomy
    query = (
        db.query(
            CompositeDemandRecord.district_code,
            CompositeDemandRecord.nco_code,
            CompositeDemandRecord.period,
            CompositeDemandRecord.posting_component,
            CompositeDemandRecord.capex_component,
            CompositeDemandRecord.velocity_component,
            CompositeDemandRecord.wage_component,
            CompositeDemandRecord.migration_component,
            CompositeDemandRecord.cdi_score,
            CompositeDemandRecord.projected_headcount_demand,
            JobPostingSignal.active_postings,
            JobPostingSignal.hiring_velocity_score,
            JobPostingSignal.median_wage_inr,
            LaborMigrationSignal.eshram_active_seekers,
            LaborMigrationSignal.inbound_labor_inflow,
            TradePassoutMetric.annual_seat_capacity,
            TradePassoutMetric.certified_passouts,
            TradePassoutMetric.effective_local_supply,
            District.tier,
            NCOOccupation.sector_code,
            NCOOccupation.nsqf_level,
            NCOOccupation.is_emerging,
            NCOOccupation.is_legacy_at_risk,
            Sector.annual_growth_rate_pct
        )
        .join(
            JobPostingSignal,
            (CompositeDemandRecord.district_code == JobPostingSignal.district_code) &
            (CompositeDemandRecord.nco_code == JobPostingSignal.nco_code) &
            (CompositeDemandRecord.period == JobPostingSignal.period)
        )
        .join(
            LaborMigrationSignal,
            (CompositeDemandRecord.district_code == LaborMigrationSignal.district_code) &
            (CompositeDemandRecord.nco_code == LaborMigrationSignal.nco_code) &
            (CompositeDemandRecord.period == LaborMigrationSignal.period)
        )
        .join(
            TradePassoutMetric,
            (CompositeDemandRecord.district_code == TradePassoutMetric.district_code) &
            (CompositeDemandRecord.nco_code == TradePassoutMetric.nco_code) &
            (CompositeDemandRecord.period == TradePassoutMetric.period)
        )
        .join(District, CompositeDemandRecord.district_code == District.code)
        .join(NCOOccupation, CompositeDemandRecord.nco_code == NCOOccupation.nco_code)
        .join(Sector, NCOOccupation.sector_code == Sector.code)
        .order_by(
            CompositeDemandRecord.district_code,
            CompositeDemandRecord.nco_code,
            CompositeDemandRecord.period
        )
    )

    rows = query.all()
    if should_close:
        db.close()

    df = pd.DataFrame([dict(r._mapping) for r in rows])

    # Convert period YYYY-MM to year and month
    df["year"] = df["period"].apply(lambda p: int(p.split("-")[0]))
    df["month"] = df["period"].apply(lambda p: int(p.split("-")[1]))

    # Cyclical trigonometric features for seasonality
    df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12.0)
    df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12.0)

    # Boolean flags as integers
    df["is_emerging"] = df["is_emerging"].astype(int)
    df["is_legacy_at_risk"] = df["is_legacy_at_risk"].astype(int)

    # Group-wise Lag and Rolling Average features per (district_code, nco_code)
    df = df.sort_values(by=["district_code", "nco_code", "period"]).reset_index(drop=True)
    
    # Lag 1, Lag 2, Lag 3 of Headcount Demand
    df["demand_lag1"] = df.groupby(["district_code", "nco_code"])["projected_headcount_demand"].shift(1)
    df["demand_lag2"] = df.groupby(["district_code", "nco_code"])["projected_headcount_demand"].shift(2)
    df["demand_lag3"] = df.groupby(["district_code", "nco_code"])["projected_headcount_demand"].shift(3)

    # Rolling 3-month moving average of demand
    df["demand_roll_mean3"] = (
        df.groupby(["district_code", "nco_code"])["projected_headcount_demand"]
        .shift(1)
        .rolling(window=3, min_periods=1)
        .mean()
    )

    # Wage ratio compared to baseline 18000
    df["wage_ratio"] = df["median_wage_inr"] / 18000.0

    # Demand-Supply Mismatch Ratio Target Label
    df["mismatch_ratio"] = df["projected_headcount_demand"] / df["effective_local_supply"].clip(lower=1)
    
    # Classify Mismatch Severity
    def label_severity(r):
        if r >= 1.60:
            return "ACUTE_SHORTAGE"
        elif r >= 1.25:
            return "MODERATE_SHORTAGE"
        elif r >= 0.80:
            return "BALANCED"
        elif r >= 0.50:
            return "MILD_SURPLUS"
        else:
            return "CHRONIC_SATURATION"

    df["severity_target"] = df["mismatch_ratio"].apply(label_severity)

    # Fill forward/backward NAs from lagging
    df["demand_lag1"] = df["demand_lag1"].fillna(df["projected_headcount_demand"])
    df["demand_lag2"] = df["demand_lag2"].fillna(df["demand_lag1"])
    df["demand_lag3"] = df["demand_lag3"].fillna(df["demand_lag2"])
    df["demand_roll_mean3"] = df["demand_roll_mean3"].fillna(df["projected_headcount_demand"])

    return df
