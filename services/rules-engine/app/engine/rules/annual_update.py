from datetime import datetime, timezone
from app.engine.rules.base import BaseRule
from app.engine.registry import RuleRegistry
from app.models.request import EvaluationRequest
from app.models.response import RuleResult

@RuleRegistry.register
class AnnualUpdateRule(BaseRule):
    @property
    def rule_id(self) -> str:
        return "annual_update"

    @property
    def rule_name(self) -> str:
        return "Mise a jour annuelle du DUERP"

    def evaluate(self, request: EvaluationRequest) -> RuleResult:
        company = request.company

        if company.employee_count < 11:
            return RuleResult(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                passed=True,
                severity="info",
                message="Moins de 11 salaries : mise a jour annuelle recommandee mais non obligatoire.",
            )

        if not request.duerp_last_validated_at:
            return RuleResult(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                passed=False,
                severity="critical",
                message="Entreprise de 11+ salaries : aucune validation du DUERP enregistree.",
            )

        last_validated = datetime.fromisoformat(request.duerp_last_validated_at)
        now = datetime.now(timezone.utc)
        days_since = (now - last_validated).days

        if days_since > 365:
            return RuleResult(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                passed=False,
                severity="critical",
                message=f"Entreprise de 11+ salaries : mise a jour annuelle du DUERP obligatoire. Derniere validation il y a {days_since} jours.",
                details={"days_since_validation": days_since},
            )

        return RuleResult(
            rule_id=self.rule_id,
            rule_name=self.rule_name,
            passed=True,
            severity="info",
            message=f"DUERP a jour (derniere validation il y a {days_since} jours).",
            details={"days_since_validation": days_since},
        )
