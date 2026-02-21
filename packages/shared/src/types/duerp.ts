import { DuerpStatus, SeverityLevel, ProbabilityLevel, ActionPriority, ActionStatus, DuerpTriggerType, ActionPlanLogEventType } from './enums';

export interface DuerpDocument {
  id: string;
  company_id: string;
  site_id: string | null;
  status: DuerpStatus;
  current_version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_validated_at: string | null;
  next_update_due: string | null;
  draft_content: Record<string, unknown> | null;
}

export interface DuerpVersion {
  id: string;
  duerp_id: string;
  version_number: number;
  content: DuerpVersionContent;
  created_by: string;
  created_at: string;
  is_signed: boolean;
}

export interface WorkUnit {
  id: string;
  duerp_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Risk {
  id: string;
  work_unit_id: string;
  category: string;
  description: string;
  severity: SeverityLevel;
  probability: ProbabilityLevel;
  existing_measures: string | null;
  is_rps: boolean;
  created_at: string;
}

export interface ActionPlan {
  id: string;
  duerp_id: string;
  risk_id: string | null;
  name: string;
  description: string | null;
  priority: ActionPriority;
  responsible: string | null;
  deadline: string | null;
  status: ActionStatus;
  is_critical: boolean;
  has_proof: boolean;
  proof_url: string | null;
  budget_estimate: number | null;
  resources: string | null;
  category: string;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface DuerpVersionContent {
  company: {
    name: string;
    siret: string;
    sector: string;
    employeeCount: number;
    hasPhysicalSite: boolean;
  };
  site: {
    name: string;
    address: string;
    city: string;
    zipCode: string;
  } | null;
  workUnits: Array<{
    name: string;
    description: string;
    risks: Array<{
      category: string;
      description: string;
      severity: string;
      probability: string;
      existingMeasures: string;
      isRps: boolean;
    }>;
  }>;
  actionPlans: Array<{
    name: string;
    description: string;
    priority: string;
    responsible: string;
    deadline: string;
    status: string;
    isCritical: boolean;
    hasProof: boolean;
  }>;
  complianceResult: ComplianceEvaluationResult | null;
  validatedBy: string;
  validatedAt: string;
}

export interface DuerpTrigger {
  id: string;
  company_id: string;
  duerp_id: string | null;
  trigger_type: DuerpTriggerType;
  title: string;
  description: string | null;
  occurred_at: string;
  is_resolved: boolean;
  resolved_by_duerp_version_id: string | null;
  created_by: string;
  created_at: string;
  resolved_at: string | null;
}

export interface ActionPlanLog {
  id: string;
  action_plan_id: string;
  event_type: ActionPlanLogEventType;
  previous_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  comment: string | null;
  created_by: string;
  created_at: string;
}

export interface ComplianceEvaluationResult {
  score: number;
  totalRules: number;
  passedRules: number;
  failedRules: number;
  results: Array<{
    ruleId: string;
    ruleName: string;
    passed: boolean;
    severity: string;
    message: string;
  }>;
}
