-- ============================================================
-- RLS pour le module EPI
-- ============================================================

-- Enable RLS
ALTER TABLE epi_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE epi_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE epi_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE epi_controles ENABLE ROW LEVEL SECURITY;
ALTER TABLE epi_documents ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- epi_categories : scoped par company_id
-- ============================================================
CREATE POLICY epi_categories_select ON epi_categories FOR SELECT
  USING (company_id = public.user_company_id());

CREATE POLICY epi_categories_insert ON epi_categories FOR INSERT
  WITH CHECK (
    company_id = public.user_company_id()
    AND public.user_role() IN ('admin', 'rh', 'manager')
  );

CREATE POLICY epi_categories_update ON epi_categories FOR UPDATE
  USING (
    company_id = public.user_company_id()
    AND public.user_role() IN ('admin', 'rh', 'manager')
  );

CREATE POLICY epi_categories_delete ON epi_categories FOR DELETE
  USING (
    company_id = public.user_company_id()
    AND public.user_role() IN ('admin')
  );

-- ============================================================
-- epi_items : scoped par company_id
-- ============================================================
CREATE POLICY epi_items_select ON epi_items FOR SELECT
  USING (company_id = public.user_company_id());

CREATE POLICY epi_items_insert ON epi_items FOR INSERT
  WITH CHECK (
    company_id = public.user_company_id()
    AND public.user_role() IN ('admin', 'rh', 'manager')
  );

CREATE POLICY epi_items_update ON epi_items FOR UPDATE
  USING (
    company_id = public.user_company_id()
    AND public.user_role() IN ('admin', 'rh', 'manager')
  );

CREATE POLICY epi_items_delete ON epi_items FOR DELETE
  USING (
    company_id = public.user_company_id()
    AND public.user_role() IN ('admin', 'rh')
  );

-- ============================================================
-- epi_attributions : via join epi_items.company_id
-- ============================================================
CREATE POLICY epi_attributions_select ON epi_attributions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM epi_items
      WHERE epi_items.id = epi_attributions.epi_item_id
      AND epi_items.company_id = public.user_company_id()
    )
  );

CREATE POLICY epi_attributions_insert ON epi_attributions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM epi_items
      WHERE epi_items.id = epi_attributions.epi_item_id
      AND epi_items.company_id = public.user_company_id()
    )
    AND public.user_role() IN ('admin', 'rh', 'manager')
  );

CREATE POLICY epi_attributions_update ON epi_attributions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM epi_items
      WHERE epi_items.id = epi_attributions.epi_item_id
      AND epi_items.company_id = public.user_company_id()
    )
    AND public.user_role() IN ('admin', 'rh', 'manager')
  );

CREATE POLICY epi_attributions_delete ON epi_attributions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM epi_items
      WHERE epi_items.id = epi_attributions.epi_item_id
      AND epi_items.company_id = public.user_company_id()
    )
    AND public.user_role() IN ('admin', 'rh')
  );

-- ============================================================
-- epi_controles : via join epi_items.company_id
-- ============================================================
CREATE POLICY epi_controles_select ON epi_controles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM epi_items
      WHERE epi_items.id = epi_controles.epi_item_id
      AND epi_items.company_id = public.user_company_id()
    )
  );

CREATE POLICY epi_controles_insert ON epi_controles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM epi_items
      WHERE epi_items.id = epi_controles.epi_item_id
      AND epi_items.company_id = public.user_company_id()
    )
    AND public.user_role() IN ('admin', 'rh', 'manager')
  );

CREATE POLICY epi_controles_update ON epi_controles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM epi_items
      WHERE epi_items.id = epi_controles.epi_item_id
      AND epi_items.company_id = public.user_company_id()
    )
    AND public.user_role() IN ('admin', 'rh', 'manager')
  );

CREATE POLICY epi_controles_delete ON epi_controles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM epi_items
      WHERE epi_items.id = epi_controles.epi_item_id
      AND epi_items.company_id = public.user_company_id()
    )
    AND public.user_role() IN ('admin', 'rh')
  );

-- ============================================================
-- epi_documents : via join epi_items.company_id
-- (all parent FKs eventually trace back to an epi_item)
-- ============================================================
CREATE POLICY epi_documents_select ON epi_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM epi_items
      WHERE (
        epi_items.id = epi_documents.epi_item_id
        OR epi_items.id IN (
          SELECT a.epi_item_id FROM epi_attributions a WHERE a.id = epi_documents.epi_attribution_id
        )
        OR epi_items.id IN (
          SELECT c.epi_item_id FROM epi_controles c WHERE c.id = epi_documents.epi_controle_id
        )
      )
      AND epi_items.company_id = public.user_company_id()
    )
  );

CREATE POLICY epi_documents_insert ON epi_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM epi_items
      WHERE (
        epi_items.id = epi_documents.epi_item_id
        OR epi_items.id IN (
          SELECT a.epi_item_id FROM epi_attributions a WHERE a.id = epi_documents.epi_attribution_id
        )
        OR epi_items.id IN (
          SELECT c.epi_item_id FROM epi_controles c WHERE c.id = epi_documents.epi_controle_id
        )
      )
      AND epi_items.company_id = public.user_company_id()
    )
    AND public.user_role() IN ('admin', 'rh', 'manager')
  );

CREATE POLICY epi_documents_delete ON epi_documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM epi_items
      WHERE (
        epi_items.id = epi_documents.epi_item_id
        OR epi_items.id IN (
          SELECT a.epi_item_id FROM epi_attributions a WHERE a.id = epi_documents.epi_attribution_id
        )
        OR epi_items.id IN (
          SELECT c.epi_item_id FROM epi_controles c WHERE c.id = epi_documents.epi_controle_id
        )
      )
      AND epi_items.company_id = public.user_company_id()
    )
    AND public.user_role() IN ('admin', 'rh')
  );
