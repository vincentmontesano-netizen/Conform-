from app.engine.rules.base import BaseRule
from app.engine.registry import RuleRegistry
from app.models.request import EvaluationRequest
from app.models.response import RuleResult

@RuleRegistry.register
class DisplayObligationRule(BaseRule):
    @property
    def rule_id(self) -> str:
        return "display_obligation"

    @property
    def rule_name(self) -> str:
        return "Obligations d'affichage"

    def evaluate(self, request: EvaluationRequest) -> RuleResult:
        company = request.company

        if not company.has_physical_site:
            return RuleResult(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                passed=True,
                severity="info",
                message="Pas de site physique : obligations d'affichage non applicables.",
            )

        message = (
            "Site physique detecte : verifier l'affichage obligatoire "
            "(consignes de securite, coordonnees inspection du travail, "
            "medecine du travail"
        )

        severity = "info"
        if company.employee_count >= 50:
            message += ", reglement interieur obligatoire pour 50+ salaries"
            severity = "warning"

        message += ")."

        return RuleResult(
            rule_id=self.rule_id,
            rule_name=self.rule_name,
            passed=True,
            severity=severity,
            message=message,
            details={
                "employee_count": company.employee_count,
                "requires_reglement_interieur": company.employee_count >= 50,
            },
        )
