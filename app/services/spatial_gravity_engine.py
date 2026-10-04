import math
from typing import List, Dict, Any, Tuple
from app.schemas.mobility import (
    CorridorRouteItem,
    RelocationSimulationRequest,
    RelocationSimulationResult
)


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two geographic coordinates in kilometers."""
    R = 6371.0  # Earth's radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 1)


class SpatialGravityEngine:
    """
    Inter-District Spatial Labour Mobility & Gravity Corridor Engine (Winning Feature 2).
    Applies spatial econometrics (Newtonian Gravity model adapted for labor migration)
    to calculate inter-district talent flow potential, destination wage draw,
    and MSDE Mobility Voucher policy savings.
    """

    def __init__(self, distance_friction_gamma: float = 1.15):
        self.gamma = distance_friction_gamma
        self.cost_to_build_new_iti_center_lakhs = 160.0  # ~₹1.60 Cr standard DGT capex per 4-unit ITI trade

    def compute_corridor_potential(
        self,
        origin: Dict[str, Any],
        destination: Dict[str, Any],
        trade: Dict[str, Any]
    ) -> CorridorRouteItem:
        dist_km = haversine_distance_km(
            origin["latitude"], origin["longitude"],
            destination["latitude"], destination["longitude"]
        )
        dist_km = max(dist_km, 30.0) # Avoid division by zero for adjacent clusters

        surplus_s = max(origin.get("surplus_headcount", 250), 10)
        deficit_d = max(destination.get("deficit_headcount", 400), 10)

        # Advanced Huff Gravity Model with Cost-of-Living PPP Adjustments
        # 1. Base Wage Premium Calculation
        w_origin = origin.get("median_wage_inr", 15000.0)
        w_dest = destination.get("median_wage_inr", 25000.0)
        
        # 2. Purchasing Power Parity (PPP) & Cost of Living (CoL) Friction
        # Urban centers have higher wages but also higher housing/living costs.
        # We apply a CoL deflator based on the destination's population density proxy.
        origin_col_index = origin.get("col_index", 1.0)
        dest_col_index = destination.get("col_index", 1.35)  # e.g., Pune/Bengaluru is 35% more expensive
        
        real_wage_origin = w_origin / origin_col_index
        real_wage_dest = w_dest / dest_col_index
        
        real_wage_premium_pct = round(max(0.0, (real_wage_dest - real_wage_origin) / real_wage_origin) * 100.0, 1)
        wage_multiplier = 1.0 + (real_wage_premium_pct / 100.0)

        # 3. Spatial Gravity Formula (Huff formulation for labor draw probability)
        # Attraction mass: (Surplus * Deficit * RealWageMultiplier) / Distance^Gamma
        raw_gravity = (surplus_s * deficit_d) / (dist_km ** self.gamma) * wage_multiplier
        
        # Normalize gravity score on a logarithmic sigmoid curve to prevent extreme outliers
        gravity_score = round(100.0 / (1.0 + math.exp(-0.005 * (raw_gravity - 2500))), 1)

        # 4. Behavioral Migration Propensity (Log-Log Elasticity Model)
        # Absorption increases logarithmically with real wage premium, decays exponentially with distance
        if real_wage_premium_pct <= 5.0:
            migration_propensity = 0.05  # Negligible movement if real wages don't justify relocation
        else:
            migration_propensity = max(0.10, min(0.75, 0.25 * math.log10(real_wage_premium_pct) * math.exp(-dist_km / 1500.0)))
            
        absorbable = int(round(min(surplus_s * migration_propensity, deficit_d * 0.85)))
        absorbable = max(absorbable, 10)  # Minimum feasible corridor batch

        # Voucher intervention cost (₹3,000 / month x 3 months = ₹9,000 per candidate)
        voucher_stipend = 9000.0
        total_intervention_cost_lakhs = round((absorbable * voucher_stipend) / 1e5, 2)
        
        # Government cost savings compared to sanctioning and constructing a new ITI wing
        capex_avoided_lakhs = round(self.cost_to_build_new_iti_center_lakhs * (absorbable / 120.0), 2)
        net_savings_lakhs = round(max(0.0, capex_avoided_lakhs - total_intervention_cost_lakhs), 2)

        summary = (
            f"Active Mobility Corridor: {origin['name']} ({origin['state_code']}) -> {destination['name']} ({destination['state_code']}). "
            f"Candidates in {origin['name']} experience a {real_wage_premium_pct}% REAL wage premium (PPP-adjusted) in {destination['name']}. "
            f"Deploying ₹{total_intervention_cost_lakhs} Lakhs in MSDE Relocation Vouchers enables {absorbable} technicians to absorb "
            f"into active industrial jobs, saving the exchequer ₹{net_savings_lakhs} Lakhs in new center capex."
        )

        return CorridorRouteItem(
            corridor_id=f"CORR-{origin['code']}-TO-{destination['code']}-{trade['nco_code']}",
            origin_district_code=origin["code"],
            origin_district_name=origin["name"],
            origin_state=origin["state_code"],
            destination_district_code=destination["code"],
            destination_district_name=destination["name"],
            destination_state=destination["state_code"],
            nco_code=trade["nco_code"],
            trade_title=trade["title"],
            distance_km=dist_km,
            origin_surplus_candidates=surplus_s,
            destination_unfilled_jobs=deficit_d,
            origin_median_wage_inr=w_origin,
            destination_median_wage_inr=w_dest,
            wage_premium_pct=real_wage_premium_pct,
            gravity_mobility_score=gravity_score,
            estimated_absorbable_candidates=absorbable,
            recommended_voucher_stipend_inr=voucher_stipend,
            total_corridor_intervention_cost_lakhs=total_intervention_cost_lakhs,
            cost_saving_vs_building_new_iti_lakhs=net_savings_lakhs,
            corridor_policy_summary=summary
        )

    def simulate_relocation_policy(
        self,
        request: RelocationSimulationRequest,
        origin_meta: Dict[str, Any],
        dest_meta: Dict[str, Any]
    ) -> RelocationSimulationResult:
        quota = request.target_relocation_quota
        stipend = request.mobility_voucher_subsidy_per_candidate_inr

        total_cost_lakhs = round((quota * stipend) / 1e5, 2)
        capex_avoided_lakhs = round((quota / 120.0) * self.cost_to_build_new_iti_center_lakhs, 2)
        net_savings_lakhs = round(max(0.0, capex_avoided_lakhs - total_cost_lakhs), 2)
        roi_multiple = round(capex_avoided_lakhs / max(total_cost_lakhs, 1.0), 1)

        dest_deficit = dest_meta.get("deficit_headcount", 500)
        fulfillment_pct = round(min(100.0, (quota / max(dest_deficit, 1)) * 100.0), 1)

        corridor_title = f"{origin_meta.get('name', 'Origin')} to {dest_meta.get('name', 'Destination')} Skilling Expressway"

        verdict = (
            f"STRATEGIC RECOMMENDATION: The relocation voucher scheme achieves {fulfillment_pct}% shortage fulfillment "
            f"in {dest_meta.get('name')} while reducing unabsorbed youth in {origin_meta.get('name')} by {quota} candidates. "
            f"Delivers a {roi_multiple}x public expenditure return by averting ₹{capex_avoided_lakhs} Lakhs in redundant brick-and-mortar capex."
        )

        return RelocationSimulationResult(
            corridor_name=corridor_title,
            origin_unemployment_reduction=quota,
            destination_shortage_fulfillment_pct=fulfillment_pct,
            total_scheme_outlay_lakhs=total_cost_lakhs,
            capex_infrastructure_avoided_lakhs=capex_avoided_lakhs,
            net_government_savings_lakhs=net_savings_lakhs,
            roi_multiple=roi_multiple,
            policy_verdict=verdict
        )


spatial_gravity_engine = SpatialGravityEngine()
