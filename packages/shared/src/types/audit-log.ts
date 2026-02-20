export interface AuditLog {
  id: string;
  user_id: string | null;
  company_id: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface ComplianceAlert {
  id: string;
  company_id: string;
  duerp_id: string | null;
  rule_type: string;
  message: string;
  severity: string;
  is_resolved: boolean;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}
