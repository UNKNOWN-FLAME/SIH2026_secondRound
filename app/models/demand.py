from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class JobPostingSignal(Base):
    __tablename__ = "job_posting_signals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    district_code = Column(String(30), ForeignKey("districts.code"), nullable=False, index=True)
    nco_code = Column(String(20), ForeignKey("nco_occupations.nco_code"), nullable=False, index=True)
    period = Column(String(7), nullable=False, index=True)  # "YYYY-MM"
    active_postings = Column(Integer, nullable=False, default=0)
    hiring_velocity_score = Column(Float, nullable=False, default=1.0)  # 0.5 (slow) to 3.0 (rapid)
    median_wage_inr = Column(Float, nullable=False, default=18000.0)
    source = Column(String(50), default="National Career Service & Aggregates")
    created_at = Column(DateTime, server_default=func.now())


class IndustrialCapexSignal(Base):
    __tablename__ = "industrial_capex_signals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_name = Column(String(200), nullable=False)
    district_code = Column(String(30), ForeignKey("districts.code"), nullable=False, index=True)
    sector_code = Column(String(50), ForeignKey("sectors.code"), nullable=False, index=True)
    primary_nco_code = Column(String(20), ForeignKey("nco_occupations.nco_code"), nullable=False, index=True)
    investment_inr_cr = Column(Float, nullable=False)
    announcement_period = Column(String(7), nullable=False)  # "YYYY-MM"
    gestation_period_months = Column(Integer, nullable=False, default=12)
    expected_direct_jobs = Column(Integer, nullable=False)
    status = Column(String(50), default="Sanctioned")  # "Announced", "Sanctioned", "Under-Construction", "Operational"
    scheme_ref = Column(String(100), nullable=True)     # e.g., "PLI Scheme", "PM Surya Ghar", "DPIIT Corridor"


class LaborMigrationSignal(Base):
    __tablename__ = "labor_migration_signals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    district_code = Column(String(30), ForeignKey("districts.code"), nullable=False, index=True)
    nco_code = Column(String(20), ForeignKey("nco_occupations.nco_code"), nullable=False, index=True)
    period = Column(String(7), nullable=False, index=True)  # "YYYY-MM"
    eshram_active_seekers = Column(Integer, nullable=False, default=0)
    outbound_mobility_ratio = Column(Float, default=0.20)  # Fraction migrating outside district for work
    inbound_labor_inflow = Column(Integer, default=0)


class CompositeDemandRecord(Base):
    __tablename__ = "composite_demand_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    district_code = Column(String(30), ForeignKey("districts.code"), nullable=False, index=True)
    nco_code = Column(String(20), ForeignKey("nco_occupations.nco_code"), nullable=False, index=True)
    period = Column(String(7), nullable=False, index=True)  # "YYYY-MM"
    
    # Sub-component normalized scores (0 to 100)
    posting_component = Column(Float, nullable=False)
    capex_component = Column(Float, nullable=False)
    velocity_component = Column(Float, nullable=False)
    wage_component = Column(Float, nullable=False)
    migration_component = Column(Float, nullable=False)

    # Final CDI score (0 to 100) and raw projected headcount demand
    cdi_score = Column(Float, nullable=False)
    projected_headcount_demand = Column(Integer, nullable=False)
