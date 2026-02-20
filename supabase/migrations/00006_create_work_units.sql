-- Migration: Create work units table
-- CONFORM+ - Unites de travail liees au DUERP

CREATE TABLE IF NOT EXISTS public.work_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duerp_id UUID NOT NULL REFERENCES public.duerp_documents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_work_units_duerp ON public.work_units(duerp_id);

COMMENT ON TABLE public.work_units IS 'Unites de travail pour l''identification des risques par poste/zone';
