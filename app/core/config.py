import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Labour Market Intelligence & Forecasting Engine (LMIS)"
    PROJECT_ID: str = "PS246-MSDE"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./lmis.db")
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    # Algorithm Parameters: CDI Weights (must sum to 1.0)
    WEIGHT_POSTINGS: float = 0.30       # Active unique NCO-coded job ads
    WEIGHT_CAPEX: float = 0.35          # Leading Indicator: Industrial Capex, PLI, Infra tenders
    WEIGHT_HIRING_VELOCITY: float = 0.15 # Velocity of job opening closures & repeat hiring
    WEIGHT_WAGE_SIGNAL: float = 0.10    # Wage premium/growth relative to baseline
    WEIGHT_MIGRATION: float = 0.10      # e-Shram outbound/inbound worker mobility
    
    # Thresholds for Mismatch Severity Ratio R = Projected Demand / Projected Supply
    RATIO_ACUTE_SHORTAGE: float = 1.60   # R >= 1.60 -> RED ALERT (Acute Shortage)
    RATIO_MODERATE_SHORTAGE: float = 1.25 # 1.25 <= R < 1.60 -> ORANGE (Moderate Shortage)
    RATIO_BALANCED_MIN: float = 0.80     # 0.80 <= R < 1.25 -> GREEN (Balanced)
    RATIO_MILD_SURPLUS: float = 0.50     # 0.50 <= R < 0.80 -> YELLOW (Mild Surplus)
    # R < 0.50 -> CRIMSON ALERT (Chronic Saturation / Oversupply)

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
