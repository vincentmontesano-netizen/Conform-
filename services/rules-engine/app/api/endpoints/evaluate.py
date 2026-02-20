from fastapi import APIRouter
from app.models.request import EvaluationRequest
from app.models.response import EvaluationResponse
from app.engine.executor import RuleExecutor

router = APIRouter()

@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_compliance(request: EvaluationRequest):
    executor = RuleExecutor()
    return executor.evaluate(request)
