from typing import List, Optional
from pydantic import BaseModel


class TrainingCenterOut(BaseModel):
    id: int
    center_code: str
    name: str
    district_code: str
    center_type: str
    is_active: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    class Config:
        from_attributes = True


class TradeCapacityOut(BaseModel):
    id: int
    center_id: int
    district_code: str
    nco_code: str
    academic_year: str
    sanctioned_seats: int
    enrolled_trainees: int
    training_duration_months: int

    class Config:
        from_attributes = True


class EffectiveSupplyBreakdown(BaseModel):
    district_code: str
    district_name: str
    nco_code: str
    trade_title: str
    period: str
    annual_seat_capacity: int
    certified_passouts: int
    pass_completion_rate: float
    local_placement_absorption_rate: float
    interdistrict_migration_rate: float
    unorganized_eshram_pool: int
    effective_local_supply: int


class SupplySummaryOut(BaseModel):
    total_training_centers: int
    total_sanctioned_seats: int
    total_enrolled_trainees: int
    total_certified_passouts: int
    total_effective_supply: int
    trades: List[EffectiveSupplyBreakdown]
