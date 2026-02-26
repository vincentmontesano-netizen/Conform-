from app.engine.rules.base import BaseRule
from app.engine.registry import RuleRegistry
from app.models.request import EvaluationRequest
from app.models.response import RuleResult

@RuleRegistry.register
class EpiExpiryRule(BaseRule):
    @property
    def rule_id(self) -> str:
        return "epi_expiry"

    @property
    def rule_name(self) -> str:
        return "EPI expires ou sans controle periodique"

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
        issues = []

        if epi.expired_items > 0:
            issues.append(f"{epi.expired_items} EPI expire(s) encore en service")

        if epi.items_without_controle > 0:
            issues.append(f"{epi.items_without_controle} EPI sans controle periodique a jour")

        if issues:
            severity = "critical" if epi.expired_items > 0 else "warning"
            return RuleResult(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                passed=False,
                severity=severity,
                message=" ; ".join(issues) + ".",
                details={
                    "expired_items": epi.expired_items,
                    "items_without_controle": epi.items_without_controle,
                },
            )

        return RuleResult(
            rule_id=self.rule_id,
            rule_name=self.rule_name,
            passed=True,
            severity="info",
            message=f"Tous les {epi.total_items} EPI sont valides et controles.",
            details={"total_items": epi.total_items},
        )
