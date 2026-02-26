from app.engine.rules.base import BaseRule
from app.engine.registry import RuleRegistry
from app.models.request import EvaluationRequest
from app.models.response import RuleResult

@RuleRegistry.register
class EpiMissingAttributionRule(BaseRule):
    @property
    def rule_id(self) -> str:
        return "epi_missing_attribution"

    @property
    def rule_name(self) -> str:
        return "Salaries sans EPI attribue"

    def evaluate(self, request: EvaluationRequest) -> RuleResult:
        if not request.epi:
            return RuleResult(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                passed=True,
                severity="info",
                message="Aucune donnee EPI fournie pour l'evaluation.",
            )

        epi = request.epi

        if epi.employees_without_epi > 0:
            return RuleResult(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                passed=False,
                severity="warning",
                message=f"{epi.employees_without_epi} salarie(s) sans EPI attribue.",
                details={"employees_without_epi": epi.employees_without_epi},
            )

        return RuleResult(
            rule_id=self.rule_id,
            rule_name=self.rule_name,
            passed=True,
            severity="info",
            message="Tous les salaries ont au moins un EPI attribue.",
        )
