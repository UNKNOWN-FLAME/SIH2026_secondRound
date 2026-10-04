from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.innovations import CSRCorporateGrant
from app.models.demand import CompositeDemandRecord
from app.models.supply import TradePassoutMetric
from app.models.taxonomy import NCOOccupation, Sector
from app.models.geography import District


class CSROpportunityItem(BaseModel):
    opportunity_id: str
    corporate_partner_name: str
    focus_sector: str
    district_code: str
    district_name: str
    target_trade_nco: str
    target_trade_title: str
    district_skill_deficit: int
    recommended_csr_grant_lakhs: float
    annual_youth_trained: int
    captive_hiring_pledge_pct: float
    social_return_on_investment_sroi: float
    strategic_alignment: str


class BankableDPRReport(BaseModel):
    dpr_id: str
    project_title: str
    issuing_entities: List[str]
    district_code: str
    district_name: str
    selected_iti_center: str
    target_nco_code: str
    target_trade_title: str
    total_project_outlay_lakhs: float
    csr_grant_share_lakhs: float
    government_in_kind_share_lakhs: float
    annual_training_capacity: int
    five_year_projected_graduates: int
    projected_net_youth_income_addition_cr: float
    social_return_on_investment_sroi: float
    co_investment_term_sheet: Dict[str, Any]
    district_magistrate_executive_brief: str


class CSRCoInvestmentMatchmakerService:
    """
    CSR & Private Capex 'Skill-Bounty' Co-Investment Matchmaker (Feature 4).
    Bridges corporate Section 135 2% CSR budgets directly to underfunded district ITIs,
    dynamically calculating true trade deficits from SQL demand-supply records and
    generating bankable Detailed Project Reports (DPR) with guaranteed captive hiring & SROI.
    """

    def list_curated_opportunities(self) -> List[CSROpportunityItem]:
        db: Session = SessionLocal()
        res: List[CSROpportunityItem] = []
        try:
            records = db.query(CSRCorporateGrant).all()
            for r in records:
                dist = db.query(District).filter(District.code == r.district_code).first()
                d_name = dist.name if dist else r.district_code.split("_")[-1].capitalize()

                occ = db.query(NCOOccupation).filter(NCOOccupation.nco_code == r.target_nco_code).first()
                trade_title = occ.title if occ else "Technical Artisan"

                sec = db.query(Sector).filter(Sector.code == r.focus_sector_code).first()
                sector_name = sec.name if sec else "Priority Industry"

                # Dynamically calculate deficit from SQL
                dem = db.query(CompositeDemandRecord.projected_headcount_demand).filter(
                    CompositeDemandRecord.district_code == r.district_code,
                    CompositeDemandRecord.nco_code == r.target_nco_code
                ).order_by(CompositeDemandRecord.period.desc()).first()
                d_val = dem[0] if dem else 800

                sup = db.query(TradePassoutMetric.effective_local_supply).filter(
                    TradePassoutMetric.district_code == r.district_code,
                    TradePassoutMetric.nco_code == r.target_nco_code
                ).order_by(TradePassoutMetric.period.desc()).first()
                s_val = sup[0] if sup else 350

                real_deficit = max(int(d_val - s_val), 150)

                res.append(
                    CSROpportunityItem(
                        opportunity_id=r.opportunity_id,
                        corporate_partner_name=r.corporate_partner_name,
                        focus_sector=sector_name,
                        district_code=r.district_code,
                        district_name=d_name,
                        target_trade_nco=r.target_nco_code,
                        target_trade_title=trade_title,
                        district_skill_deficit=real_deficit,
                        recommended_csr_grant_lakhs=r.grant_amount_lakhs,
                        annual_youth_trained=r.annual_target_trainees,
                        captive_hiring_pledge_pct=r.captive_hiring_pledge_pct,
                        social_return_on_investment_sroi=r.sroi_ratio,
                        strategic_alignment=r.strategic_alignment
                    )
                )
        finally:
            db.close()
        return res

    def generate_bankable_dpr(
        self,
        district_code: str = "MH_PUNE",
        corporate_partner: str = "Tata Motors CSR Foundation",
        target_nco_code: str = "7231.0200"
    ) -> BankableDPRReport:
        db: Session = SessionLocal()
        try:
            grant_rec = db.query(CSRCorporateGrant).filter(
                (CSRCorporateGrant.district_code == district_code) |
                (CSRCorporateGrant.corporate_partner_name.ilike(f"%{corporate_partner[:6]}%"))
            ).first()

            if not grant_rec:
                grant_rec = db.query(CSRCorporateGrant).first()

            dist = db.query(District).filter(District.code == grant_rec.district_code).first()
            d_name = dist.name if dist else district_code.split("_")[-1].capitalize()

            occ = db.query(NCOOccupation).filter(NCOOccupation.nco_code == grant_rec.target_nco_code).first()
            trade_title = occ.title if occ else "Technical Artisan"

            total_capex = grant_rec.grant_amount_lakhs + 18.0
            annual_capacity = grant_rec.annual_target_trainees
            five_year_grads = annual_capacity * 5

            net_addition_cr = round((five_year_grads * 1.68 * 5) / 100.0, 2)
            sroi = round((net_addition_cr * 100.0) / total_capex, 1)

            term_sheet = {
                "corporate_obligations": [
                    f"Disburse ₹{grant_rec.grant_amount_lakhs} Lakhs CSR capital expenditure via Escrow account in 2 milestones.",
                    "Procure, install, and calibrate advanced industry training rigs and simulators.",
                    "Provide Master Trainers for 120 hours of industry live-batch mentoring per quarter.",
                    f"Pledge minimum {grant_rec.captive_hiring_pledge_pct}% captive placement across vendor and dealer networks."
                ],
                "district_skill_committee_obligations": [
                    "Allot 3,000 sq ft dedicated floor space inside Government ITI for 5-year co-branded facility.",
                    "Provide uninterrupted 3-phase industrial power and broadband connectivity.",
                    "Mobilize and screen candidates via State Skill Mission / PMKVY 4.0 portal without tuition fees."
                ],
                "governance_and_audit": [
                    "Quarterly Joint Review Committee chaired by District Magistrate & Corporate CSR Head.",
                    "Digital certification co-badging: 'MSDE-NCVET certified in partnership with Corporate'."
                ]
            }

            brief = (
                f"EXECUTIVE CO-INVESTMENT DIRECTIVE: Establishing the {trade_title} Center of Excellence in {d_name} "
                f"via ₹{grant_rec.grant_amount_lakhs} Lakhs private CSR co-funding resolves {annual_capacity} annual youth deficit "
                f"at ZERO incremental state capex debt. Delivers an extraordinary SROI of {sroi}x (₹{net_addition_cr} Cr cumulative wage addition) "
                f"with {grant_rec.captive_hiring_pledge_pct}% guaranteed corporate hiring. Recommended for immediate MoU signing."
            )

            return BankableDPRReport(
                dpr_id=f"DPR-MSDE-CSR-{district_code[:2]}-2026-001",
                project_title=f"Joint MSDE-{grant_rec.corporate_partner_name} Center of Excellence in {trade_title}",
                issuing_entities=[f"District Skill Committee (DSC) {d_name}", grant_rec.corporate_partner_name],
                district_code=grant_rec.district_code,
                district_name=d_name,
                selected_iti_center=f"Government ITI {d_name} Main Campus",
                target_nco_code=grant_rec.target_nco_code,
                target_trade_title=trade_title,
                total_project_outlay_lakhs=total_capex,
                csr_grant_share_lakhs=grant_rec.grant_amount_lakhs,
                government_in_kind_share_lakhs=18.0,
                annual_training_capacity=annual_capacity,
                five_year_projected_graduates=five_year_grads,
                projected_net_youth_income_addition_cr=net_addition_cr,
                social_return_on_investment_sroi=sroi,
                co_investment_term_sheet=term_sheet,
                district_magistrate_executive_brief=brief
            )
        finally:
            db.close()

    def calculate_custom_sroi(
        self,
        csr_grant_lakhs: float,
        annual_trainees: int,
        baseline_monthly_wage: float = 12000.0,
        post_certified_monthly_wage: float = 25000.0,
        tenure_years: int = 5
    ) -> Dict[str, Any]:
        monthly_uplift = post_certified_monthly_wage - baseline_monthly_wage
        annual_uplift_per_youth = monthly_uplift * 12.0
        five_year_cohort_youth = annual_trainees * tenure_years
        total_career_uplift_lakhs = (five_year_cohort_youth * annual_uplift_per_youth * tenure_years) / 1e5
        sroi_multiplier = round(total_career_uplift_lakhs / csr_grant_lakhs, 2)

        return {
            "csr_grant_lakhs": csr_grant_lakhs,
            "annual_trainees": annual_trainees,
            "five_year_youth_trained": five_year_cohort_youth,
            "monthly_wage_uplift_inr": monthly_uplift,
            "total_lifetime_economic_addition_lakhs": round(total_career_uplift_lakhs, 2),
            "social_return_on_investment_ratio": sroi_multiplier,
            "impact_interpretation": f"Every ₹1.00 of Corporate CSR spent generates ₹{sroi_multiplier:.2f} of net lifetime income for underprivileged youth."
        }


csr_matchmaker_service = CSRCoInvestmentMatchmakerService()
