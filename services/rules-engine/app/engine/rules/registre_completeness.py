from app.engine.rules.base import BaseRule
from app.engine.registry import RuleRegistry
from app.models.request import EvaluationRequest
from app.models.response import RuleResult

@RuleRegistry.register
class RegistreCompletenessRule(BaseRule):
    @property
    def rule_id(self) -> str:
        return "registre_completeness"

    @property
    def rule_name(self) -> str:
        return "Completude des registres obligatoires"

    def evaluate(self, request: EvaluationRequest) -> RuleResult:
        if not request.registres:
            return RuleResult(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                passed=True,
                severity="info",
                message="Aucune donnee registre fournie pour l'evaluation.",
            )

        r = request.registres
        missing = [t for t in r.required_types if t not in r.existing_types]

        if missing:
            return RuleResult(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                passed=False,
                severity="warning",
                message=f"{len(missing)} registre(s) obligatoire(s) manquant(s) : {', '.join(missing)}.",
                details={
                    "missing_types": missing,
                    "required_count": len(r.required_types),
                    "existing_count": len(r.existing_types),
                },
            )

        return RuleResult(
            rule_id=self.rule_id,
            rule_name=self.rule_name,
            passed=True,
            severity="info",
            message=f"Tous les {len(r.required_types)} registres obligatoires sont presents.",
        )
