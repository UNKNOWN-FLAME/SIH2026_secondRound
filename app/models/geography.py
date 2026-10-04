from sqlalchemy import Column, String, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class State(Base):
    __tablename__ = "states"

    code = Column(String(10), primary_key=True, index=True)  # e.g., "MH", "UP"
    name = Column(String(100), nullable=False)
    capital = Column(String(100), nullable=True)

    districts = relationship("District", back_populates="state", cascade="all, delete-orphan")


class District(Base):
    __tablename__ = "districts"

    code = Column(String(30), primary_key=True, index=True)  # e.g., "MH_PUNE"
    lgd_code = Column(Integer, unique=True, nullable=False)   # Official Local Govt Directory Code
    name = Column(String(100), nullable=False, index=True)
    state_code = Column(String(10), ForeignKey("states.code"), nullable=False, index=True)
    tier = Column(String(10), nullable=False, default="Tier 2")  # Tier 1, Tier 2, Tier 3
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    industrial_focus = Column(String(255), nullable=True)

    state = relationship("State", back_populates="districts")
