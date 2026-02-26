from app.engine.rules.base import BaseRule
from app.engine.registry import RuleRegistry
from app.models.request import EvaluationRequest
from app.models.response import RuleResult

@RuleRegistry.register
class FormationExpiryRule(BaseRule):
    @property
    def rule_id(self) -> str:
        return "formation_expiry"

    @property
    def rule_name(self) -> str:
        return "Formations ou habilitations expirees"

    def evaluate(self, request: EvaluationRequest) -> RuleResult:
        if not request.formations:
            return RuleResult(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                passed=True,
                severity="info",
                message="Aucune donnee formation fournie pour l'evaluation.",
            )

        f = request.formations
        issues = []

        if f.expired_formations > 0:
            issues.append(f"{f.expired_formations} formation(s) expiree(s)")

        if f.expired_habilitations > 0:
            issues.append(f"{f.expired_habilitations} habilitation(s) expiree(s)")

        if issues:
            return RuleResult(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                passed=False,
                severity="critical",
                message=" ; ".join(issues) + ".",
                details={
                    "expired_formations": f.expired_formations,
                    "expired_habilitations": f.expired_habilitations,
                },
            )

        return RuleResult(
            rule_id=self.rule_id,
            rule_name=self.rule_name,
            passed=True,
            severity="info",
            message="Toutes les formations et habilitations sont a jour.",
        )
