from app.engine.rules.base import BaseRule
from app.engine.registry import RuleRegistry
from app.models.request import EvaluationRequest
from app.models.response import RuleResult

@RuleRegistry.register
class RegistreEntryExpiryRule(BaseRule):
    @property
    def rule_id(self) -> str:
        return "registre_entry_expiry"

    @property
    def rule_name(self) -> str:
        return "Entrees de registre expirees"

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
        issues = []

        if r.entries_expired > 0:
            issues.append(f"{r.entries_expired} entree(s) de registre expiree(s)")

        if r.entries_expiring > 0:
            issues.append(f"{r.entries_expiring} entree(s) expirant dans les 30 prochains jours")

        if r.entries_expired > 0:
            return RuleResult(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                passed=False,
                severity="warning",
                message=" ; ".join(issues) + ".",
                details={
                    "entries_expired": r.entries_expired,
                    "entries_expiring": r.entries_expiring,
                },
            )

        if r.entries_expiring > 0:
            return RuleResult(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                passed=True,
                severity="warning",
                message=f"{r.entries_expiring} entree(s) expirant bientot (aucune expiree).",
                details={"entries_expiring": r.entries_expiring},
            )

        return RuleResult(
            rule_id=self.rule_id,
            rule_name=self.rule_name,
            passed=True,
            severity="info",
            message="Toutes les entrees de registre sont a jour.",
        )
