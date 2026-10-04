from typing import List, Dict, Any
from app.core.config import settings
from app.schemas.mismatch import (
    MismatchRankingItem,
    EarlyWarningAlert,
    DistrictHeatmapPoint,
    MismatchDashboardResponse
)


class MismatchEngine:
    """
    Demand-Supply Mismatch & Early-Warning Diagnostic Engine.
    Identifies severe imbalances, ranks trade vulnerabilities,
    and generates explainable policy alerts.
    """

    def classify_severity(self, mismatch_ratio: float) -> Dict[str, str]:
        if mismatch_ratio >= settings.RATIO_ACUTE_SHORTAGE:
            return {
                "flag": "ACUTE_SHORTAGE",
                "action": "URGENT_SANCTION",
                "color": "RED",
                "desc": "Severe talent deficit; hiring times exceeding 60 days; immediate seat expansion required."
            }
        elif mismatch_ratio >= settings.RATIO_MODERATE_SHORTAGE:
            return {
                "flag": "MODERATE_SHORTAGE",
                "action": "EXPAND_CAPACITY",
                "color": "ORANGE",
                "desc": "Growing demand outstripping current passouts; expand secondary shifts in active ITIs."
            }
        elif mismatch_ratio >= settings.RATIO_BALANCED_MIN:
            return {
                "flag": "BALANCED",
                "action": "EQUILIBRIUM",
                "color": "GREEN",
                "desc": "Healthy equilibrium between training seats and industry placement capacity."
            }
        elif mismatch_ratio >= settings.RATIO_MILD_SURPLUS:
            return {
                "flag": "MILD_SURPLUS",
                "action": "FREEZE_TARGETS",
                "color": "YELLOW",
                "desc": "Graduates exceeding placement demand; freeze seat additions and audit quality."
            }
        else:
            return {
                "flag": "CHRONIC_SATURATION",
                "action": "MANDATORY_RESKILLING",
                "color": "CRIMSON",
                "desc": "Severe persistent oversupply; over 50% graduates unabsorbed; initiate Bridge Course transition."
            }

    def generate_dashboard(
        self,
        records: List[Dict[str, Any]],
        districts_meta: Dict[str, Any]
    ) -> MismatchDashboardResponse:
        """
        Processes trade-district records into an executive diagnostic dashboard.
        """
        all_items: List[MismatchRankingItem] = []
        early_warnings: List[EarlyWarningAlert] = []
        district_stats: Dict[str, Dict[str, Any]] = {}

        total_shortage = 0
        total_surplus = 0

        for r in records:
            d_code = r["district_code"]
            nco_code = r["nco_code"]
            demand = int(r["demand"])
            supply = int(r["supply"])
            gap = demand - supply
            ratio = round(demand / max(supply, 1), 2)
            meta = self.classify_severity(ratio)

            if gap > 0:
                total_shortage += gap
            else:
                total_surplus += abs(gap)

            item = MismatchRankingItem(
                rank=0,  # Assigned after sorting
                district_code=d_code,
                district_name=r.get("district_name", d_code),
                state_code=r.get("state_code", "IN"),
                nco_code=nco_code,
                trade_title=r.get("trade_title", nco_code),
                sector_code=r.get("sector_code", "GENERAL"),
                projected_demand=demand,
                projected_supply=supply,
                gap_headcount=gap,
                mismatch_ratio=ratio,
                severity_flag=meta["flag"],
                action_type=meta["action"],
                alert_summary=meta["desc"]
            )
            all_items.append(item)

            # Accumulate district stats
            if d_code not in district_stats:
                district_stats[d_code] = {
                    "acute_shortages": 0,
                    "chronic_surpluses": 0,
                    "max_shortage_gap": -1,
                    "max_shortage_trade": "None",
                    "max_surplus_gap": -1,
                    "max_surplus_trade": "None",
                    "total_gap_magnitude": 0
                }

            d_entry = district_stats[d_code]
            d_entry["total_gap_magnitude"] += abs(gap)

            if meta["flag"] == "ACUTE_SHORTAGE":
                d_entry["acute_shortages"] += 1
                if gap > d_entry["max_shortage_gap"]:
                    d_entry["max_shortage_gap"] = gap
                    d_entry["max_shortage_trade"] = item.trade_title
                
                # Create early warning alert
                early_warnings.append(
                    EarlyWarningAlert(
                        alert_id=f"WARN-{d_code}-{nco_code}",
                        alert_level="RED",
                        district_name=item.district_name,
                        state_code=item.state_code,
                        trade_title=item.trade_title,
                        nco_code=nco_code,
                        issue=f"Severe Shortage: Projected demand ({demand}) exceeds effective supply ({supply}) by {ratio}x.",
                        projected_impact="Critical industry project bottlenecks; employer wage inflation; unfilled apprentice quotas.",
                        recommended_intervention=f"Sanction at least {int(round(gap * 0.7))} new PMKVY/ITI seats and onboard industrial training partners."
                    )
                )
            elif meta["flag"] == "CHRONIC_SATURATION":
                d_entry["chronic_surpluses"] += 1
                surplus_mag = abs(gap)
                if surplus_mag > d_entry["max_surplus_gap"]:
                    d_entry["max_surplus_gap"] = surplus_mag
                    d_entry["max_surplus_trade"] = item.trade_title

                early_warnings.append(
                    EarlyWarningAlert(
                        alert_id=f"WARN-{d_code}-{nco_code}",
                        alert_level="ORANGE",
                        district_name=item.district_name,
                        state_code=item.state_code,
                        trade_title=item.trade_title,
                        nco_code=nco_code,
                        issue=f"Chronic Saturation: Supply ({supply}) is {round(supply/max(demand,1), 1)}x higher than local hiring demand ({demand}).",
                        projected_impact="Underemployment; depressed placement conversion; low institutional ROI.",
                        recommended_intervention="Freeze legacy seat intake; activate Skill Adjacency Bridge Courses to adjacent high-growth trades."
                    )
                )

        # Sort shortages (descending by gap)
        shortage_items = sorted([i for i in all_items if i.gap_headcount > 0], key=lambda x: x.gap_headcount, reverse=True)
        for idx, itm in enumerate(shortage_items, 1):
            itm.rank = idx

        # Sort surpluses (descending by absolute surplus gap)
        surplus_items = sorted([i for i in all_items if i.gap_headcount < 0], key=lambda x: abs(x.gap_headcount), reverse=True)
        for idx, itm in enumerate(surplus_items, 1):
            itm.rank = idx

        # Build district heatmap points
        heatmaps: List[DistrictHeatmapPoint] = []
        for d_code, s in district_stats.items():
            meta = districts_meta.get(d_code, {})
            stress_score = min(round((s["total_gap_magnitude"] / 1500.0) * 100, 1), 100.0)
            heatmaps.append(
                DistrictHeatmapPoint(
                    district_code=d_code,
                    district_name=meta.get("name", d_code),
                    state_code=meta.get("state_code", "IN"),
                    latitude=meta.get("latitude", 20.5937),
                    longitude=meta.get("longitude", 78.9629),
                    industrial_focus=meta.get("industrial_focus", "General Industrial Cluster"),
                    overall_stress_index=stress_score,
                    dominant_shortage_trade=s["max_shortage_trade"],
                    dominant_surplus_trade=s["max_surplus_trade"],
                    acute_shortages_count=s["acute_shortages"],
                    chronic_surpluses_count=s["chronic_surpluses"]
                )
            )

        # Overall system balance metric
        total_volume = total_shortage + total_surplus
        balance_pct = round(max(100.0 - (total_volume / 10000.0) * 100, 20.0), 1)

        return MismatchDashboardResponse(
            total_shortage_headcount=total_shortage,
            total_surplus_headcount=total_surplus,
            overall_system_balance_pct=balance_pct,
            top_undersupplied_trades=shortage_items[:10],
            top_oversupplied_trades=surplus_items[:10],
            active_early_warnings=early_warnings[:15],
            district_heatmaps=heatmaps
        )


mismatch_engine = MismatchEngine()
