from pydantic import BaseModel
from typing import Optional

class CompanyContext(BaseModel):
    company_id: str
    employee_count: int
    has_physical_site: bool
    sector: str

class RiskItem(BaseModel):
    risk_id: str
    category: str
    severity: str
    probability: str
    is_rps: bool
    work_unit_name: str

class ActionItem(BaseModel):
    action_id: str
    name: str
    is_critical: bool
    has_proof: bool
    status: str
    deadline: Optional[str] = None

class EvaluationRequest(BaseModel):
    company: CompanyContext
    risks: list[RiskItem]
    actions: list[ActionItem]
    duerp_last_validated_at: Optional[str] = None
