-- Migration: Create sites table
-- CONFORM+ - Localisations multi-sites par entreprise

CREATE TABLE IF NOT EXISTS public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  zip_code VARCHAR(10),
  is_main BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sites_company_id ON public.sites(company_id);

COMMENT ON TABLE public.sites IS 'Sites physiques des entreprises (multi-sites)';
