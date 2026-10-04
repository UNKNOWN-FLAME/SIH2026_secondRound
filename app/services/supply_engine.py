from typing import Dict, Any


class SupplyEngine:
    """
    Effective Supply Modeling Engine.
    Discounts nominal sanctioned seats by realistic ground constraints:
    - Capacity utilization (enrollment vs seats)
    - DGT/NCVET assessment completion & pass rate
    - Local district retention vs inter-district outward migration
    - e-Shram unorganized active job seeker talent pool
    """

    def calculate_effective_supply(
        self,
        sanctioned_seats: int,
        enrolled_trainees: int,
        pass_completion_rate: float = 0.78,
        local_retention_rate: float = 0.45,
        interdistrict_migration_rate: float = 0.25,
        eshram_active_seekers: int = 120,
        eshram_employability_factor: float = 0.35
    ) -> Dict[str, Any]:
        """
        Calculates realistic, employable supply ready for district absorption.
        """
        # Certified passout cohort
        certified_passouts = int(round(enrolled_trainees * pass_completion_rate))

        # Passouts staying in local district
        locally_available_certified = int(round(certified_passouts * local_retention_rate))

        # Qualified portion of e-Shram unorganized workers seeking transition
        employable_eshram_pool = int(round(eshram_active_seekers * eshram_employability_factor))

        # Total effective supply ready for industry hiring
        effective_supply = locally_available_certified + employable_eshram_pool

        return {
            "annual_seat_capacity": sanctioned_seats,
            "enrolled_trainees": enrolled_trainees,
            "certified_passouts": certified_passouts,
            "pass_completion_rate": round(pass_completion_rate, 2),
            "local_placement_absorption_rate": round(local_retention_rate, 2),
            "interdistrict_migration_rate": round(interdistrict_migration_rate, 2),
            "unorganized_eshram_pool": employable_eshram_pool,
            "effective_local_supply": max(effective_supply, 5)
        }


supply_engine = SupplyEngine()
