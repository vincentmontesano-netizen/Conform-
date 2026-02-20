from typing import Type
from app.engine.rules.base import BaseRule

class RuleRegistry:
    _rules: list[Type[BaseRule]] = []

    @classmethod
    def register(cls, rule_class: Type[BaseRule]):
        cls._rules.append(rule_class)
        return rule_class

    @classmethod
    def get_all(cls) -> list[BaseRule]:
        return [rule() for rule in cls._rules]

    @classmethod
    def clear(cls):
        cls._rules = []
