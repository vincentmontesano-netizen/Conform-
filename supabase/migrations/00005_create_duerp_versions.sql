-- Migration: Create DUERP versions table (IMMUTABLE)
-- CONFORM+ - Versions immuables des DUERP - fondation de la tracabilite legale

CREATE TABLE IF NOT EXISTS public.duerp_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duerp_id UUID NOT NULL REFERENCES public.duerp_documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_signed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(duerp_id, version_number)
);

-- IMMUTABILITE : empecher UPDATE et DELETE sur les versions
CREATE OR REPLACE FUNCTION public.prevent_version_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Les versions DUERP sont immuables et ne peuvent pas etre modifiees ou supprimees';
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER prevent_duerp_version_update
  BEFORE UPDATE ON public.duerp_versions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_version_modification();

CREATE TRIGGER prevent_duerp_version_delete
  BEFORE DELETE ON public.duerp_versions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_version_modification();

COMMENT ON TABLE public.duerp_versions IS 'Versions immuables des DUERP - snapshots JSONB horodates, non modifiables';
