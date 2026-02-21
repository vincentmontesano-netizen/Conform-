-- Migration 00015: DUERP update triggers (declencheurs de mise a jour)
-- Types: changement organisation, accident, evolution poste, etc.

CREATE TYPE public.duerp_trigger_type AS ENUM (
  'changement_organisation',
  'accident_travail',
  'evolution_poste',
  'nouvelle_reglementation',
  'mise_a_jour_annuelle',
  'autre'
);

CREATE TABLE IF NOT EXISTS public.duerp_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  duerp_id UUID REFERENCES public.duerp_documents(id) ON DELETE SET NULL,
  trigger_type public.duerp_trigger_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  occurred_at DATE NOT NULL DEFAULT CURRENT_DATE,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by_duerp_version_id UUID REFERENCES public.duerp_versions(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_duerp_triggers_company ON public.duerp_triggers(company_id);
CREATE INDEX idx_duerp_triggers_unresolved ON public.duerp_triggers(is_resolved) WHERE is_resolved = false;

COMMENT ON TABLE public.duerp_triggers IS 'Declencheurs de mise a jour DUERP (accident, changement orga, etc.)';
