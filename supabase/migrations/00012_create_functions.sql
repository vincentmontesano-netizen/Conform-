-- Migration: Database functions
-- CONFORM+ - Auto-increment version DUERP

-- Auto-increment le numero de version et met a jour le document parent
CREATE OR REPLACE FUNCTION public.auto_increment_duerp_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version_number := COALESCE(
    (SELECT MAX(version_number) FROM public.duerp_versions WHERE duerp_id = NEW.duerp_id),
    0
  ) + 1;

  -- Met a jour current_version sur le document parent
  UPDATE public.duerp_documents
    SET current_version = NEW.version_number
    WHERE id = NEW.duerp_id;

  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER auto_version_duerp
  BEFORE INSERT ON public.duerp_versions
  FOR EACH ROW EXECUTE FUNCTION public.auto_increment_duerp_version();
