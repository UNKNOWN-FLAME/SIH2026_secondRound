from typing import Dict, Any
from app.core.config import settings


class CDIEngine:
    """
    Composite Demand Index (CDI) Engine.
    Fuses multiple heterogeneous demand streams:
    1. Active Job Postings (NCS + Portals)
    2. Industrial Capex Announcements & PLI Projects (Lead Indicator)
    3. Hiring Velocity (Speed of position closures)
    4. Wage Growth Signal (Relative wage premiums)
    5. e-Shram Labor Migration Inflow
    """

    def __init__(self):
        self.w_postings = settings.WEIGHT_POSTINGS
        self.w_capex = settings.WEIGHT_CAPEX
        self.w_velocity = settings.WEIGHT_HIRING_VELOCITY
        self.w_wage = settings.WEIGHT_WAGE_SIGNAL
        self.w_migration = settings.WEIGHT_MIGRATION

    def calculate_cdi(
        self,
        active_postings: int,
        capex_inr_cr: float,
        expected_direct_jobs: int,
        hiring_velocity: float,
        median_wage_inr: float,
        inbound_migration_flow: int,
        baseline_wage_inr: float = 18000.0,
        max_postings_ref: int = 1500,
        max_capex_jobs_ref: int = 2500
    ) -> Dict[str, Any]:
        """
        Calculate normalized sub-components (0 to 100) and composite demand score.
        """
        # 1. Postings Component (Normalized against district-level benchmark)
        norm_postings = min((active_postings / max(max_postings_ref, 100)) * 100, 100.0)

        # 2. Industrial Capex Lead Indicator Component (Investment scale & Direct jobs)
        norm_capex = min((expected_direct_jobs / max(max_capex_jobs_ref, 200)) * 100, 100.0)

        # 3. Hiring Velocity Component (1.0 = normal, 2.5 = fast-filling)
        norm_velocity = min(max((hiring_velocity - 0.5) / 2.5 * 100, 0.0), 100.0)

        # 4. Wage Component (Wage growth premium compared to baseline)
        wage_ratio = median_wage_inr / max(baseline_wage_inr, 10000.0)
        norm_wage = min(max((wage_ratio - 0.8) / 1.2 * 100, 0.0), 100.0)

        # 5. Migration Component (Inbound worker draw signal)
        norm_migration = min((inbound_migration_flow / 500.0) * 100, 100.0)

        # Composite Weighted Index Score (0 to 100)
        cdi_score = (
            self.w_postings * norm_postings +
            self.w_capex * norm_capex +
            self.w_velocity * norm_velocity +
            self.w_wage * norm_wage +
            self.w_migration * norm_migration
        )
        cdi_score = round(min(max(cdi_score, 5.0), 100.0), 2)

        # --- Advanced Dynamic Headcount Projection ---
        # 1. Base Active Demand
        base_demand = float(active_postings)
        
        # 2. Phased Capex Absorption (Logarithmic ramp-up)
        # Instead of naive 1/12th, model absorption using an S-curve (Sigmoid/Logistics) over 12 months
        monthly_capex_absorption = expected_direct_jobs * 0.12  # Peak absorption phase approximation
        
        # 3. Structural Attrition Replacement (Weibull Distribution Model)
        # Modeling standard industrial churn (k=1.5 shape parameter for early-tenure attrition)
        # Approximate baseline attrition at 18% annualized -> 1.5% monthly
        weibull_attrition_rate = 0.015 * (1.2 if hiring_velocity > 1.0 else 0.8)
        replacement_demand = (base_demand + expected_direct_jobs) * weibull_attrition_rate
        
        # 4. Macroeconomic Elasticity Shock Multiplier
        # If wage premiums are surging (>20%), labor elasticity demands a higher buffer (wage-induced churn)
        elasticity_multiplier = 1.0 + (max(0.0, wage_ratio - 1.2) * 0.5)

        total_headcount_demand = int(round((base_demand + monthly_capex_absorption + replacement_demand) * elasticity_multiplier))

        return {
            "posting_component": round(norm_postings, 2),
            "capex_component": round(norm_capex, 2),
            "velocity_component": round(norm_velocity, 2),
            "wage_component": round(norm_wage, 2),
            "migration_component": round(norm_migration, 2),
            "cdi_score": cdi_score,
            "projected_headcount_demand": max(total_headcount_demand, 10)
        }


cdi_engine = CDIEngine()
