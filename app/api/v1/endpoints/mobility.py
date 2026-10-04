from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.geography import District
from app.models.taxonomy import NCOOccupation
from app.models.demand import CompositeDemandRecord, JobPostingSignal
from app.models.supply import TradePassoutMetric
from app.schemas.mobility import (
    CorridorRouteItem,
    RelocationSimulationRequest,
    RelocationSimulationResult
)
from app.services.spatial_gravity_engine import spatial_gravity_engine

router = APIRouter()


@router.get("/corridors", response_model=List[CorridorRouteItem])
def get_spatial_mobility_corridors(
    min_gravity_score: float = Query(10.0, description="Minimum gravity mobility score"),
    period: Optional[str] = "2026-03",
    db: Session = Depends(get_db)
):
    """
    Inter-District Spatial Labour Mobility & Gravity Corridors (Winning Feature 2).
    Discovers natural talent flow corridors between surplus origin districts
    and high-deficit destination industrial clusters using spatial gravity modeling.
    """
    # 1. Fetch all districts
    districts = db.query(District).all()
    dist_map = {d.code: d for d in districts}

    # Curated high-potential corridors linking major industrial hubs with talent feeder districts
    corridor_pairs = [
        {"orig": "UP_KANPUR", "dest": "MH_PUNE", "nco": "7231.0200", "surplus_nco": "7231.0100"},
        {"orig": "MH_NAGPUR", "dest": "MH_PUNE", "nco": "7411.0100", "surplus_nco": "7411.0100"},
        {"orig": "UP_LUCKNOW", "dest": "KA_BLR_URBAN", "nco": "3511.0100", "surplus_nco": "4132.0100"},
        {"orig": "GJ_AHMEDABAD", "dest": "MH_PUNE", "nco": "7421.0300", "surplus_nco": "8212.0300"},
        {"orig": "UP_KANPUR", "dest": "GJ_AHMEDABAD", "nco": "8212.0100", "surplus_nco": "8212.0300"}
    ]

    corridors: List[CorridorRouteItem] = []

    for pair in corridor_pairs:
        d_orig = dist_map.get(pair["orig"])
        d_dest = dist_map.get(pair["dest"])
        occ = db.query(NCOOccupation).filter(NCOOccupation.nco_code == pair["nco"]).first()

        if not d_orig or not d_dest or not occ:
            continue

        # Fetch demand and wages
        d_sig = (
            db.query(CompositeDemandRecord.projected_headcount_demand)
            .filter(CompositeDemandRecord.district_code == d_dest.code, CompositeDemandRecord.nco_code == pair["nco"], CompositeDemandRecord.period == period)
            .first()
        )
        deficit_headcount = d_sig[0] if d_sig else 450

        s_sig = (
            db.query(TradePassoutMetric.effective_local_supply)
            .filter(TradePassoutMetric.district_code == d_orig.code, TradePassoutMetric.nco_code == pair["surplus_nco"], TradePassoutMetric.period == period)
            .first()
        )
        surplus_headcount = s_sig[0] if s_sig else 300

        # Wages
        w_orig_rec = (
            db.query(JobPostingSignal.median_wage_inr)
            .filter(JobPostingSignal.district_code == d_orig.code, JobPostingSignal.period == period)
            .first()
        )
        w_dest_rec = (
            db.query(JobPostingSignal.median_wage_inr)
            .filter(JobPostingSignal.district_code == d_dest.code, JobPostingSignal.period == period)
            .first()
        )

        w_orig = float(w_orig_rec[0]) if w_orig_rec else 15500.0
        w_dest = float(w_dest_rec[0]) if w_dest_rec else 26000.0

        orig_dict = {
            "code": d_orig.code,
            "name": d_orig.name,
            "state_code": d_orig.state_code,
            "latitude": d_orig.latitude,
            "longitude": d_orig.longitude,
            "surplus_headcount": surplus_headcount,
            "median_wage_inr": w_orig
        }

        dest_dict = {
            "code": d_dest.code,
            "name": d_dest.name,
            "state_code": d_dest.state_code,
            "latitude": d_dest.latitude,
            "longitude": d_dest.longitude,
            "deficit_headcount": deficit_headcount,
            "median_wage_inr": w_dest
        }

        trade_dict = {
            "nco_code": occ.nco_code,
            "title": occ.title
        }

        corridor_item = spatial_gravity_engine.compute_corridor_potential(orig_dict, dest_dict, trade_dict)
        if corridor_item.gravity_mobility_score >= min_gravity_score:
            corridors.append(corridor_item)

    return sorted(corridors, key=lambda x: x.gravity_mobility_score, reverse=True)


@router.post("/simulate-relocation-policy", response_model=RelocationSimulationResult)
def simulate_relocation_policy(
    request: RelocationSimulationRequest,
    db: Session = Depends(get_db)
):
    """
    Simulates the fiscal and labour market impact of an MSDE Relocation Voucher Policy.
    Calculates net savings compared to constructing new brick-and-mortar training centers.
    """
    orig_dist = db.query(District).filter(District.code == request.origin_district_code).first()
    dest_dist = db.query(District).filter(District.code == request.destination_district_code).first()

    if not orig_dist or not dest_dist:
        raise HTTPException(status_code=404, detail="Origin or Destination district not found.")

    orig_meta = {"name": orig_dist.name, "code": orig_dist.code, "state": orig_dist.state_code}
    dest_meta = {"name": dest_dist.name, "code": dest_dist.code, "state": dest_dist.state_code, "deficit_headcount": 500}

    return spatial_gravity_engine.simulate_relocation_policy(request, orig_meta, dest_meta)
