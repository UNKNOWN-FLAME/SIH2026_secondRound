from sqlalchemy import Column, String, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class TrainingCenter(Base):
    __tablename__ = "training_centers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    center_code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    district_code = Column(String(30), ForeignKey("districts.code"), nullable=False, index=True)
    center_type = Column(String(50), nullable=False)  # "ITI_GOVT", "ITI_PRIVATE", "PMKVY_TC", "NSTI"
    is_active = Column(Integer, default=1)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)


class TradeCapacity(Base):
    __tablename__ = "trade_capacities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    center_id = Column(Integer, ForeignKey("training_centers.id"), nullable=False, index=True)
    district_code = Column(String(30), ForeignKey("districts.code"), nullable=False, index=True)
    nco_code = Column(String(20), ForeignKey("nco_occupations.nco_code"), nullable=False, index=True)
    academic_year = Column(String(10), nullable=False)  # "2024-25", "2025-26"
    sanctioned_seats = Column(Integer, nullable=False, default=40)
    enrolled_trainees = Column(Integer, nullable=False, default=35)
    training_duration_months = Column(Integer, default=12)


class TradePassoutMetric(Base):
    __tablename__ = "trade_passout_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    district_code = Column(String(30), ForeignKey("districts.code"), nullable=False, index=True)
    nco_code = Column(String(20), ForeignKey("nco_occupations.nco_code"), nullable=False, index=True)
    period = Column(String(7), nullable=False, index=True)  # "YYYY-MM"
    
    annual_seat_capacity = Column(Integer, nullable=False)
    certified_passouts = Column(Integer, nullable=False)
    pass_completion_rate = Column(Float, default=0.78)        # ~78% pass the DGT/NCVET assessment
    local_placement_absorption_rate = Column(Float, default=0.45) # ~45% absorb into local jobs
    interdistrict_migration_rate = Column(Float, default=0.25)    # ~25% leave district for jobs
    unorganized_eshram_pool = Column(Integer, default=0)
    
    # Final calculated effective supply headcount ready for immediate local absorption
    effective_local_supply = Column(Integer, nullable=False)
