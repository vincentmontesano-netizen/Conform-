from app.models.request import EvaluationRequest
from app.models.response import EvaluationResponse, RuleResult
from app.engine.registry import RuleRegistry
# Import rules to trigger registration
import app.engine.rules  # noqa: F401

class RuleExecutor:
    def evaluate(self, request: EvaluationRequest) -> EvaluationResponse:
        rules = RuleRegistry.get_all()
        results: list[RuleResult] = []

        for rule in rules:
            result = rule.evaluate(request)
            results.append(result)

        return EvaluationResponse.create(results)
