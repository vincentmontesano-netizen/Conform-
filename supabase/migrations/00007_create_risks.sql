-- Migration: Create risks table
-- CONFORM+ - Risques identifies par unite de travail

CREATE TYPE public.severity_level AS ENUM ('faible', 'modere', 'eleve', 'critique');
CREATE TYPE public.probability_level AS ENUM ('improbable', 'peu_probable', 'probable', 'tres_probable');

CREATE TABLE IF NOT EXISTS public.risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_unit_id UUID NOT NULL REFERENCES public.work_units(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  severity public.severity_level NOT NULL,
  probability public.probability_level NOT NULL,
  existing_measures TEXT,
  is_rps BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_risks_work_unit ON public.risks(work_unit_id);
CREATE INDEX idx_risks_is_rps ON public.risks(is_rps) WHERE is_rps = true;

COMMENT ON TABLE public.risks IS 'Risques professionnels identifies - severite x probabilite, flag RPS';
