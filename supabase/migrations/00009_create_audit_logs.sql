-- Migration: Create audit logs table (IMMUTABLE)
-- CONFORM+ - Journal d'audit infalsifiable pour tracabilite inspection

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES public.companies(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- IMMUTABILITE : empecher UPDATE et DELETE sur les logs d'audit
CREATE TRIGGER prevent_audit_log_update
  BEFORE UPDATE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_version_modification();

CREATE TRIGGER prevent_audit_log_delete
  BEFORE DELETE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_version_modification();

CREATE INDEX idx_audit_logs_company ON public.audit_logs(company_id);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

COMMENT ON TABLE public.audit_logs IS 'Journal d''audit immuable - preuve de tracabilite pour inspection du travail';
