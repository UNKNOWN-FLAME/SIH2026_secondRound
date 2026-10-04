from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text
from app.core.database import Base


class TimeSeriesForecastRecord(Base):
    __tablename__ = "time_series_forecast_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    district_code = Column(String(30), ForeignKey("districts.code"), nullable=False, index=True)
    nco_code = Column(String(20), ForeignKey("nco_occupations.nco_code"), nullable=False, index=True)
    forecast_period = Column(String(7), nullable=False, index=True)  # "YYYY-MM"
    horizon_months = Column(Integer, nullable=False, default=12)     # 12 or 24
    
    # Statistical bounds (Median and 80% CI interval [P10, P90])
    projected_demand_p50 = Column(Float, nullable=False)
    projected_demand_p10 = Column(Float, nullable=False)
    projected_demand_p90 = Column(Float, nullable=False)
    
    # Supply forecast
    projected_supply = Column(Float, nullable=False)
    
    # Mismatch metrics
    mismatch_ratio = Column(Float, nullable=False)  # Demand / Supply
    severity_flag = Column(String(30), nullable=False, index=True)  # ACUTE_SHORTAGE, BALANCED, CHRONIC_SATURATION, etc.
    action_priority = Column(Integer, nullable=False, default=3)   # 1 (Highest urgency) to 5
    alert_narrative = Column(Text, nullable=False)                  # Plain English policy explanation for officers
