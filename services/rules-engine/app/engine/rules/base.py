from abc import ABC, abstractmethod
from app.models.request import EvaluationRequest
from app.models.response import RuleResult

class BaseRule(ABC):
    @property
    @abstractmethod
    def rule_id(self) -> str:
        pass

    @property
    @abstractmethod
    def rule_name(self) -> str:
        pass

    @abstractmethod
    def evaluate(self, request: EvaluationRequest) -> RuleResult:
        pass
