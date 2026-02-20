-- Migration: Create DUERP documents table
-- CONFORM+ - Documents DUERP (Document Unique d'Evaluation des Risques Professionnels)

CREATE TYPE public.duerp_status AS ENUM ('draft', 'in_progress', 'pending_validation', 'validated', 'archived');

CREATE TABLE IF NOT EXISTS public.duerp_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  status public.duerp_status NOT NULL DEFAULT 'draft',
  current_version INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_duerp_company ON public.duerp_documents(company_id);
CREATE INDEX idx_duerp_site ON public.duerp_documents(site_id);

CREATE TRIGGER update_duerp_updated_at
  BEFORE UPDATE ON public.duerp_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.duerp_documents IS 'Documents DUERP - obligatoire meme sans salarie';
