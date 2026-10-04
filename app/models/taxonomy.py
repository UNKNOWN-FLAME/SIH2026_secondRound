from sqlalchemy import Column, String, Integer, Float, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Sector(Base):
    __tablename__ = "sectors"

    code = Column(String(50), primary_key=True, index=True)  # e.g., "GREEN_ENERGY", "ESDM"
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    annual_growth_rate_pct = Column(Float, default=12.0)
    ssc_name = Column(String(150), nullable=True)  # Sector Skill Council Name

    occupations = relationship("NCOOccupation", back_populates="sector", cascade="all, delete-orphan")


class NCOOccupation(Base):
    __tablename__ = "nco_occupations"

    nco_code = Column(String(20), primary_key=True, index=True)  # e.g., "7411.0100"
    division = Column(String(10), nullable=False)                 # e.g., "7" - Craft and Related Trades
    sub_division = Column(String(10), nullable=False)             # e.g., "74" - Electrical & Electronic
    group_code = Column(String(10), nullable=False)               # e.g., "7411" - Building & Related Electricians
    title = Column(String(200), nullable=False, index=True)
    sector_code = Column(String(50), ForeignKey("sectors.code"), nullable=False, index=True)
    nsqf_level = Column(Integer, nullable=False, default=4)       # Level 1 to 8
    description = Column(Text, nullable=False)
    typical_roles = Column(Text, nullable=True)                   # Comma-separated alternative job titles
    core_skills = Column(Text, nullable=False)                    # JSON list of core skills/competencies
    is_emerging = Column(Boolean, default=False)                  # High-growth emerging trade
    is_legacy_at_risk = Column(Boolean, default=False)            # Legacy trade facing obsolescence/saturation

    sector = relationship("Sector", back_populates="occupations")
