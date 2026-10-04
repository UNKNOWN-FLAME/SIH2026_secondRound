from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class GovernmentTenderRecord(Base):
    __tablename__ = "government_tenders"

    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(String(64), unique=True, index=True, nullable=False)
    portal_source = Column(String(32), default="GeM")  # "GeM" or "CPPP"
    tender_title = Column(String(255), nullable=False)
    issuing_authority = Column(String(255), nullable=False)
    district_code = Column(String(32), ForeignKey("districts.code"), nullable=False, index=True)
    tender_value_cr = Column(Float, nullable=False)
    work_category = Column(String(64), nullable=False)
    raw_scope_text = Column(Text, nullable=False)
    project_commencement_date = Column(String(32), default="2026-10-15")
    lead_time_months = Column(Integer, default=8)
    total_projected_workforce = Column(Integer, default=100)
    created_at = Column(DateTime, default=datetime.utcnow)

    boq_items = relationship("TenderBoQItem", back_populates="tender", cascade="all, delete-orphan")


class TenderBoQItem(Base):
    __tablename__ = "tender_boq_items"

    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(String(64), ForeignKey("government_tenders.tender_id"), nullable=False, index=True)
    nco_code = Column(String(16), ForeignKey("nco_occupations.nco_code"), nullable=False)
    trade_title = Column(String(255), nullable=False)
    nsqf_level = Column(Integer, default=4)
    headcount_required = Column(Integer, default=50)
    deployment_phase = Column(String(128), default="Months 3-9 of Project")
    critical_skills_json = Column(Text, default="[]")

    tender = relationship("GovernmentTenderRecord", back_populates="boq_items")


class DistrictMaterialInflow(Base):
    __tablename__ = "district_material_inflows"

    id = Column(Integer, primary_key=True, index=True)
    district_code = Column(String(32), ForeignKey("districts.code"), nullable=False, index=True)
    period = Column(String(16), nullable=False, index=True)  # e.g., "2026-03"
    commodity_code = Column(String(64), nullable=False)
    commodity_name = Column(String(255), nullable=False)
    unit = Column(String(32), nullable=False)
    monthly_inflow_volume = Column(Float, nullable=False)
    volume_growth_mom_pct = Column(Float, default=0.0)
    mapped_nco_code = Column(String(16), ForeignKey("nco_occupations.nco_code"), nullable=False)
    labor_intensity_factor = Column(Float, default=1.0)
    derived_informal_headcount = Column(Integer, default=50)


class VerifiedArtisanCandidate(Base):
    __tablename__ = "verified_artisan_candidates"

    id = Column(Integer, primary_key=True, index=True)
    candidate_uid = Column(String(64), unique=True, index=True, nullable=False)
    full_name = Column(String(128), nullable=False)
    phone = Column(String(32), nullable=False)
    district_code = Column(String(32), ForeignKey("districts.code"), nullable=False, index=True)
    nco_code = Column(String(16), ForeignKey("nco_occupations.nco_code"), nullable=False, index=True)
    nsqf_level = Column(Integer, default=4)
    institution_name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    verification_status = Column(String(64), default="MSDE_VERIFIED_SKILL_ID")
    blockchain_anchor_hash = Column(String(128), unique=True, index=True, nullable=True) # Phase 3: ZKP/Blockchain
    is_available = Column(Boolean, default=True)


class RailwayTransitCorridorRecord(Base):
    __tablename__ = "railway_transit_corridors"

    id = Column(Integer, primary_key=True, index=True)
    corridor_route = Column(String(255), nullable=False)
    origin_station_code = Column(String(16), nullable=False)
    origin_hub_name = Column(String(128), nullable=False)
    origin_state_code = Column(String(8), nullable=False)
    origin_district_code = Column(String(32), ForeignKey("districts.code"), nullable=False)
    destination_station_code = Column(String(16), nullable=False)
    destination_cluster_name = Column(String(128), nullable=False)
    destination_state_code = Column(String(8), nullable=False)
    destination_district_code = Column(String(32), nullable=False)
    reporting_week = Column(String(16), nullable=False, index=True)  # e.g., "2026-W42"
    weekly_passenger_outflow = Column(Integer, nullable=False)
    dominant_trade_nco = Column(String(16), ForeignKey("nco_occupations.nco_code"), nullable=False)
    migrant_artisans_count = Column(Integer, nullable=False)
    transit_reason_tag = Column(String(128), nullable=False)


class GatiShaktiProjectNode(Base):
    __tablename__ = "gati_shakti_project_nodes"

    id = Column(Integer, primary_key=True, index=True)
    node_id = Column(String(64), unique=True, index=True, nullable=False)
    node_name = Column(String(255), nullable=False)
    corridor_type = Column(String(128), nullable=False)
    district_code = Column(String(32), ForeignKey("districts.code"), nullable=False, index=True)
    state_code = Column(String(8), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    investment_inr_cr = Column(Float, nullable=False)
    operational_go_live_target = Column(String(16), default="2027-04")
    catchment_radius_km = Column(Float, default=50.0)
    lead_time_months = Column(Integer, default=12)


class SkillObsolescenceMetric(Base):
    __tablename__ = "skill_obsolescence_metrics"

    id = Column(Integer, primary_key=True, index=True)
    nco_code = Column(String(16), ForeignKey("nco_occupations.nco_code"), unique=True, nullable=False)
    obsolescence_velocity_score_pct = Column(Float, nullable=False)
    automation_risk_tier = Column(String(64), nullable=False)
    technology_drivers_json = Column(Text, default="[]")
    routineness_index = Column(Float, default=0.5)
    projected_displacement_months = Column(Integer, default=24)
    pivot_target_nco = Column(String(16), ForeignKey("nco_occupations.nco_code"), nullable=False)
    micro_credential_code = Column(String(64), nullable=False)
    training_duration_hours = Column(Integer, default=40)


class CSRCorporateGrant(Base):
    __tablename__ = "csr_corporate_grants"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(String(64), unique=True, index=True, nullable=False)
    corporate_partner_name = Column(String(255), nullable=False)
    focus_sector_code = Column(String(32), ForeignKey("sectors.code"), nullable=False)
    district_code = Column(String(32), ForeignKey("districts.code"), nullable=False, index=True)
    target_nco_code = Column(String(16), ForeignKey("nco_occupations.nco_code"), nullable=False)
    grant_amount_lakhs = Column(Float, nullable=False)
    annual_target_trainees = Column(Integer, default=250)
    captive_hiring_pledge_pct = Column(Float, default=75.0)
    sroi_ratio = Column(Float, default=8.0)
    strategic_alignment = Column(Text, nullable=False)
