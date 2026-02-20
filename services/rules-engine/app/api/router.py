from fastapi import APIRouter
from app.api.endpoints import evaluate, health

router = APIRouter()
router.include_router(health.router, tags=["health"])
router.include_router(evaluate.router, tags=["evaluate"])
