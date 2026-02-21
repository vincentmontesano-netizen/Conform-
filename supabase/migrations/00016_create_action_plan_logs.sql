-- Migration 00016: Action plan logs (journal des actions)
-- Immutable log of all changes, comments, and proof uploads on action plans

CREATE TABLE IF NOT EXISTS public.action_plan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_plan_id UUID NOT NULL REFERENCES public.action_plans(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'status_change', 'comment', 'proof_uploaded', 'proof_removed', 'field_updated'
  previous_value JSONB,
  new_value JSONB,
  comment TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_action_plan_logs_action ON public.action_plan_logs(action_plan_id);
CREATE INDEX idx_action_plan_logs_created ON public.action_plan_logs(created_at DESC);

-- IMMUTABLE: reuse existing prevent_version_modification function
CREATE TRIGGER prevent_action_plan_log_update
  BEFORE UPDATE ON public.action_plan_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_version_modification();

CREATE TRIGGER prevent_action_plan_log_delete
  BEFORE DELETE ON public.action_plan_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_version_modification();

COMMENT ON TABLE public.action_plan_logs IS 'Journal immuable des modifications et commentaires sur les actions de prevention';
