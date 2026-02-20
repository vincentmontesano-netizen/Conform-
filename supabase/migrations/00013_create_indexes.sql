-- Migration: Additional indexes for performance
-- CONFORM+ - Optimisation des requetes frequentes

-- Recherche par SIRET
CREATE INDEX IF NOT EXISTS idx_companies_siret ON public.companies(siret);

-- Recherche par secteur
CREATE INDEX IF NOT EXISTS idx_companies_sector ON public.companies(sector);

-- DUERP par statut
CREATE INDEX IF NOT EXISTS idx_duerp_status ON public.duerp_documents(status);

-- Versions par duerp_id (deja couvert par l'unique constraint mais utile pour les lectures)
CREATE INDEX IF NOT EXISTS idx_duerp_versions_duerp ON public.duerp_versions(duerp_id);

-- Risques par categorie
CREATE INDEX IF NOT EXISTS idx_risks_category ON public.risks(category);

-- Actions par statut
CREATE INDEX IF NOT EXISTS idx_action_plans_status ON public.action_plans(status);

-- Alertes par severite
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.compliance_alerts(severity);

-- Profils par role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
