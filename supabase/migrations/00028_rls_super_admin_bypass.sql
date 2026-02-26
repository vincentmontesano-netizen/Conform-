-- Migration: RLS super_admin bypass
-- CONFORM+ — Le super_admin (admin plateforme) doit voir et gérer toutes les données du back-office

-- Helper: is current user super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- === COMPANIES : super_admin peut tout sélectionner ===
CREATE POLICY "super_admin_select_all_companies" ON public.companies
  FOR SELECT
  USING (public.is_super_admin());

-- === PROFILES : super_admin peut tout sélectionner et mettre à jour ===
CREATE POLICY "super_admin_select_all_profiles" ON public.profiles
  FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "super_admin_update_all_profiles" ON public.profiles
  FOR UPDATE
  USING (public.is_super_admin());

-- === AUDIT_LOGS : super_admin peut tout sélectionner ===
CREATE POLICY "super_admin_select_all_audit_logs" ON public.audit_logs
  FOR SELECT
  USING (public.is_super_admin());

-- === SUBSCRIPTIONS : la politique "Only super_admin can modify" avec FOR ALL
-- couvre déjà SELECT pour super_admin. Aucune politique supplémentaire requise.

COMMENT ON FUNCTION public.is_super_admin() IS 'Retourne true si l''utilisateur connecté a le rôle super_admin (admin plateforme)';
