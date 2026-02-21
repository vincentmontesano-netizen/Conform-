-- Migration 00018: RLS policies for new tables (duerp_triggers, action_plan_logs)

-- ===== duerp_triggers =====
ALTER TABLE public.duerp_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_company_triggers" ON public.duerp_triggers
  FOR SELECT USING (company_id = public.user_company_id());

CREATE POLICY "non_inspecteur_insert_triggers" ON public.duerp_triggers
  FOR INSERT WITH CHECK (
    company_id = public.user_company_id()
    AND public.user_role() != 'inspecteur'
  );

CREATE POLICY "non_inspecteur_update_triggers" ON public.duerp_triggers
  FOR UPDATE USING (
    company_id = public.user_company_id()
    AND public.user_role() != 'inspecteur'
  );

-- ===== action_plan_logs =====
ALTER TABLE public.action_plan_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_action_plan_logs" ON public.action_plan_logs
  FOR SELECT USING (
    action_plan_id IN (
      SELECT ap.id FROM public.action_plans ap
      JOIN public.duerp_documents d ON d.id = ap.duerp_id
      WHERE d.company_id = public.user_company_id()
    )
  );

-- Insert allowed for non-inspecteur via join check
CREATE POLICY "non_inspecteur_insert_action_plan_logs" ON public.action_plan_logs
  FOR INSERT WITH CHECK (
    action_plan_id IN (
      SELECT ap.id FROM public.action_plans ap
      JOIN public.duerp_documents d ON d.id = ap.duerp_id
      WHERE d.company_id = public.user_company_id()
        AND public.user_role() != 'inspecteur'
    )
  );
