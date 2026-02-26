from app.engine.rules.base import BaseRule
from app.engine.registry import RuleRegistry
from app.models.request import EvaluationRequest
from app.models.response import RuleResult

@RuleRegistry.register
class FormationMissingRule(BaseRule):
    @property
    def rule_id(self) -> str:
        return "formation_missing"

    @property
    def rule_name(self) -> str:
        return "Formations obligatoires manquantes"

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

        if f.missing_obligatoires > 0:
            return RuleResult(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                passed=False,
                severity="critical",
                message=f"{f.missing_obligatoires} formation(s) obligatoire(s) manquante(s) pour les salaries concernes.",
                details={
                    "missing_obligatoires": f.missing_obligatoires,
                    "total_employees": f.total_employees,
                    "global_score": f.global_score,
                },
            )

        return RuleResult(
            rule_id=self.rule_id,
            rule_name=self.rule_name,
            passed=True,
            severity="info",
            message=f"Toutes les formations obligatoires sont couvertes (score : {f.global_score}%).",
            details={"global_score": f.global_score},
        )
