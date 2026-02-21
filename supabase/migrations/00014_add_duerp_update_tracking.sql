-- Migration 00014: Add DUERP update tracking columns + draft content
-- Supports: annual update obligation, draft auto-save

ALTER TABLE public.duerp_documents
  ADD COLUMN IF NOT EXISTS last_validated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_update_due DATE,
  ADD COLUMN IF NOT EXISTS draft_content JSONB;

-- When a DUERP version is created (validation), update tracking dates
CREATE OR REPLACE FUNCTION public.update_duerp_validation_dates()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.duerp_documents
    SET
      last_validated_at = NEW.created_at,
      next_update_due = (NEW.created_at + INTERVAL '1 year')::DATE
    WHERE id = NEW.duerp_id;
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER on_version_created_update_dates
  AFTER INSERT ON public.duerp_versions
  FOR EACH ROW EXECUTE FUNCTION public.update_duerp_validation_dates();

-- Backfill existing data from latest version per DUERP
UPDATE public.duerp_documents d
SET
  last_validated_at = v.created_at,
  next_update_due = (v.created_at + INTERVAL '1 year')::DATE
FROM (
  SELECT DISTINCT ON (duerp_id) duerp_id, created_at
  FROM public.duerp_versions
  ORDER BY duerp_id, version_number DESC
) v
WHERE d.id = v.duerp_id;

-- Index for overdue queries
CREATE INDEX IF NOT EXISTS idx_duerp_next_update_due ON public.duerp_documents(next_update_due);
