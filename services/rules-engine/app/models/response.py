from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone

class RuleResult(BaseModel):
    rule_id: str
    rule_name: str
    passed: bool
    severity: str
    message: str
    details: Optional[dict] = None

class ComplianceScore(BaseModel):
    score: int
    total_rules: int
    passed_rules: int
    failed_rules: int

class EvaluationResponse(BaseModel):
    compliance_score: ComplianceScore
    results: list[RuleResult]
    alerts: list[RuleResult]
    evaluated_at: str

    @staticmethod
    def create(results: list[RuleResult]) -> "EvaluationResponse":
        passed = [r for r in results if r.passed]
        failed = [r for r in results if not r.passed]
        total = len(results)
        score = int((len(passed) / total) * 100) if total > 0 else 100

        return EvaluationResponse(
            compliance_score=ComplianceScore(
                score=score,
                total_rules=total,
                passed_rules=len(passed),
                failed_rules=len(failed),
            ),
            results=results,
            alerts=failed,
            evaluated_at=datetime.now(timezone.utc).isoformat(),
        )
