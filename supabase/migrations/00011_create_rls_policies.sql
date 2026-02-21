-- Migration: Row Level Security policies
-- CONFORM+ - Isolation des donnees par entreprise, inspecteur read-only

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duerp_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duerp_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_alerts ENABLE ROW LEVEL SECURITY;

-- Helper: get user's company_id
CREATE OR REPLACE FUNCTION public.user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get user's role
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- === COMPANIES ===
CREATE POLICY "users_select_own_company" ON public.companies
  FOR SELECT USING (id = public.user_company_id());

CREATE POLICY "admin_insert_company" ON public.companies
  FOR INSERT WITH CHECK (public.user_role() = 'admin');

CREATE POLICY "admin_update_company" ON public.companies
  FOR UPDATE USING (id = public.user_company_id() AND public.user_role() = 'admin');

-- === SITES ===
CREATE POLICY "users_select_company_sites" ON public.sites
  FOR SELECT USING (company_id = public.user_company_id());

CREATE POLICY "write_roles_insert_sites" ON public.sites
  FOR INSERT WITH CHECK (
    company_id = public.user_company_id()
    AND public.user_role() IN ('admin', 'manager')
  );

CREATE POLICY "write_roles_update_sites" ON public.sites
  FOR UPDATE USING (
    company_id = public.user_company_id()
    AND public.user_role() IN ('admin', 'manager')
  );

CREATE POLICY "admin_delete_sites" ON public.sites
  FOR DELETE USING (
    company_id = public.user_company_id()
    AND public.user_role() = 'admin'
  );

-- === PROFILES ===
CREATE POLICY "users_select_company_profiles" ON public.profiles
  FOR SELECT USING (company_id = public.user_company_id() OR user_id = auth.uid());

CREATE POLICY "admin_insert_profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.user_role() = 'admin' OR user_id = auth.uid());

CREATE POLICY "admin_update_profiles" ON public.profiles
  FOR UPDATE USING (public.user_role() = 'admin' OR user_id = auth.uid());

-- === DUERP DOCUMENTS ===
CREATE POLICY "users_select_company_duerps" ON public.duerp_documents
  FOR SELECT USING (company_id = public.user_company_id());

CREATE POLICY "write_roles_insert_duerps" ON public.duerp_documents
  FOR INSERT WITH CHECK (
    company_id = public.user_company_id()
    AND public.user_role() != 'inspecteur'
  );

CREATE POLICY "write_roles_update_duerps" ON public.duerp_documents
  FOR UPDATE USING (
    company_id = public.user_company_id()
    AND public.user_role() != 'inspecteur'
  );

-- === DUERP VERSIONS ===
CREATE POLICY "users_select_company_versions" ON public.duerp_versions
  FOR SELECT USING (
    duerp_id IN (SELECT id FROM public.duerp_documents WHERE company_id = public.user_company_id())
  );

CREATE POLICY "write_roles_insert_versions" ON public.duerp_versions
  FOR INSERT WITH CHECK (
    duerp_id IN (SELECT id FROM public.duerp_documents WHERE company_id = public.user_company_id())
    AND public.user_role() != 'inspecteur'
  );

-- === WORK UNITS ===
CREATE POLICY "users_select_company_work_units" ON public.work_units
  FOR SELECT USING (
    duerp_id IN (SELECT id FROM public.duerp_documents WHERE company_id = public.user_company_id())
  );

CREATE POLICY "write_roles_manage_work_units" ON public.work_units
  FOR ALL USING (
    duerp_id IN (SELECT id FROM public.duerp_documents WHERE company_id = public.user_company_id())
    AND public.user_role() != 'inspecteur'
  );

-- === RISKS ===
CREATE POLICY "users_select_company_risks" ON public.risks
  FOR SELECT USING (
    work_unit_id IN (
      SELECT wu.id FROM public.work_units wu
      JOIN public.duerp_documents d ON d.id = wu.duerp_id
      WHERE d.company_id = public.user_company_id()
    )
  );

CREATE POLICY "write_roles_manage_risks" ON public.risks
  FOR ALL USING (
    work_unit_id IN (
      SELECT wu.id FROM public.work_units wu
      JOIN public.duerp_documents d ON d.id = wu.duerp_id
      WHERE d.company_id = public.user_company_id()
    )
    AND public.user_role() != 'inspecteur'
  );

-- === ACTION PLANS ===
CREATE POLICY "users_select_company_actions" ON public.action_plans
  FOR SELECT USING (
    duerp_id IN (SELECT id FROM public.duerp_documents WHERE company_id = public.user_company_id())
  );

CREATE POLICY "write_roles_manage_actions" ON public.action_plans
  FOR ALL USING (
    duerp_id IN (SELECT id FROM public.duerp_documents WHERE company_id = public.user_company_id())
    AND public.user_role() != 'inspecteur'
  );

-- === AUDIT LOGS ===
CREATE POLICY "users_select_company_audit_logs" ON public.audit_logs
  FOR SELECT USING (company_id = public.user_company_id());

-- Insert via service role only (no RLS insert policy for regular users)

-- === COMPLIANCE ALERTS ===
CREATE POLICY "users_select_company_alerts" ON public.compliance_alerts
  FOR SELECT USING (company_id = public.user_company_id());

CREATE POLICY "write_roles_manage_alerts" ON public.compliance_alerts
  FOR UPDATE USING (
    company_id = public.user_company_id()
    AND public.user_role() IN ('admin', 'rh')
  );
