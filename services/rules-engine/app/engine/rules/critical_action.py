from app.engine.rules.base import BaseRule
from app.engine.registry import RuleRegistry
from app.models.request import EvaluationRequest
from app.models.response import RuleResult

@RuleRegistry.register
class CriticalActionRule(BaseRule):
    @property
    def rule_id(self) -> str:
        return "critical_proof"

    @property
    def rule_name(self) -> str:
        return "Preuve obligatoire pour actions critiques"

    def evaluate(self, request: EvaluationRequest) -> RuleResult:
        critical_without_proof = [
            action for action in request.actions
            if action.is_critical and not action.has_proof
        ]

        if not critical_without_proof:
            return RuleResult(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                passed=True,
                severity="info",
                message="Toutes les actions critiques disposent d'une preuve justificative.",
            )

        missing_names = [a.name for a in critical_without_proof]
        return RuleResult(
            rule_id=self.rule_id,
            rule_name=self.rule_name,
            passed=False,
            severity="warning",
            message=f"{len(critical_without_proof)} action(s) critique(s) sans preuve justificative.",
            details={"actions_without_proof": missing_names},
        )
