from app.engine.rules.base import BaseRule
from app.engine.registry import RuleRegistry
from app.models.request import EvaluationRequest
from app.models.response import RuleResult

@RuleRegistry.register
class RPSDetectionRule(BaseRule):
    @property
    def rule_id(self) -> str:
        return "rps_plan"

    @property
    def rule_name(self) -> str:
        return "Plan d'actions RPS obligatoire"

    def evaluate(self, request: EvaluationRequest) -> RuleResult:
        rps_risks = [r for r in request.risks if r.is_rps]

        if not rps_risks:
            return RuleResult(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                passed=True,
                severity="info",
                message="Aucun risque psycho-social detecte.",
            )

        # Check if there are any actions at all (simplified check)
        active_actions = [
            a for a in request.actions
            if a.status in ("a_faire", "en_cours")
        ]

        if not active_actions:
            return RuleResult(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                passed=False,
                severity="critical",
                message=f"{len(rps_risks)} risque(s) psycho-sociaux identifies sans plan d'action associe.",
                details={
                    "rps_count": len(rps_risks),
                    "rps_work_units": list(set(r.work_unit_name for r in rps_risks)),
                },
            )

        return RuleResult(
            rule_id=self.rule_id,
            rule_name=self.rule_name,
            passed=True,
            severity="info",
            message=f"RPS detectes ({len(rps_risks)}) avec plan d'actions en place ({len(active_actions)} action(s)).",
        )
