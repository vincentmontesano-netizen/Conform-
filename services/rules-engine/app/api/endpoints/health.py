from fastapi import APIRouter
from app.engine.registry import RuleRegistry

router = APIRouter()

@router.get("/health")
async def health_check():
    rules = RuleRegistry.get_all()
    return {
        "status": "healthy",
        "version": "0.1.0",
        "rules_count": len(rules),
        "rules": [rule.rule_id for rule in rules],
    }
