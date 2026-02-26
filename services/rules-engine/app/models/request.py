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

# ─── Cross-module contexts ────────────────────────────

class EpiContext(BaseModel):
    total_items: int
    expired_items: int
    items_without_controle: int
    employees_without_epi: int

class FormationContext(BaseModel):
    total_employees: int
    expired_formations: int
    expired_habilitations: int
    missing_obligatoires: int
    global_score: int  # 0-100

class RegistreContext(BaseModel):
    required_types: list[str]
    existing_types: list[str]
    entries_expiring: int
    entries_expired: int

# ─── Main request ─────────────────────────────────────

class EvaluationRequest(BaseModel):
    company: CompanyContext
    risks: list[RiskItem]
    actions: list[ActionItem]
    duerp_last_validated_at: Optional[str] = None
    epi: Optional[EpiContext] = None
    formations: Optional[FormationContext] = None
    registres: Optional[RegistreContext] = None
