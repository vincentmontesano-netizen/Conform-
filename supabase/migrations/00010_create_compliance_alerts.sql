-- Migration: Create compliance alerts table
-- CONFORM+ - Alertes de conformite generees par le moteur de regles

CREATE TYPE public.alert_severity AS ENUM ('info', 'warning', 'critical');

CREATE TABLE IF NOT EXISTS public.compliance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  duerp_id UUID REFERENCES public.duerp_documents(id) ON DELETE SET NULL,
  rule_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity public.alert_severity NOT NULL DEFAULT 'warning',
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_alerts_company ON public.compliance_alerts(company_id);
CREATE INDEX idx_alerts_unresolved ON public.compliance_alerts(is_resolved) WHERE is_resolved = false;

COMMENT ON TABLE public.compliance_alerts IS 'Alertes de non-conformite detectees par le moteur de regles';
