-- Migration: RLS policies for registres tables

-- Enable RLS
ALTER TABLE registres ENABLE ROW LEVEL SECURITY;
ALTER TABLE registre_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE registre_entry_documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- registres policies
-- ============================================

CREATE POLICY registres_select ON registres
  FOR SELECT USING (company_id = public.user_company_id());

CREATE POLICY registres_insert ON registres
  FOR INSERT WITH CHECK (
    company_id = public.user_company_id()
    AND public.user_role() IN ('admin', 'rh', 'manager')
  );

CREATE POLICY registres_update ON registres
  FOR UPDATE USING (
    company_id = public.user_company_id()
    AND public.user_role() IN ('admin', 'rh', 'manager')
  );

CREATE POLICY registres_delete ON registres
  FOR DELETE USING (
    company_id = public.user_company_id()
    AND public.user_role() IN ('admin')
  );

-- ============================================
-- registre_entries policies (via join to registres)
-- ============================================

CREATE POLICY registre_entries_select ON registre_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM registres
      WHERE registres.id = registre_entries.registre_id
      AND registres.company_id = public.user_company_id()
    )
  );

CREATE POLICY registre_entries_insert ON registre_entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM registres
      WHERE registres.id = registre_entries.registre_id
      AND registres.company_id = public.user_company_id()
    )
    AND public.user_role() IN ('admin', 'rh', 'manager')
  );

CREATE POLICY registre_entries_update ON registre_entries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM registres
      WHERE registres.id = registre_entries.registre_id
      AND registres.company_id = public.user_company_id()
    )
    AND public.user_role() IN ('admin', 'rh', 'manager')
  );

CREATE POLICY registre_entries_delete ON registre_entries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM registres
      WHERE registres.id = registre_entries.registre_id
      AND registres.company_id = public.user_company_id()
    )
    AND public.user_role() IN ('admin', 'rh')
  );

-- ============================================
-- registre_entry_documents policies (via entries → registres)
-- ============================================

CREATE POLICY registre_entry_docs_select ON registre_entry_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM registre_entries e
      JOIN registres r ON r.id = e.registre_id
      WHERE e.id = registre_entry_documents.entry_id
      AND r.company_id = public.user_company_id()
    )
  );

CREATE POLICY registre_entry_docs_insert ON registre_entry_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM registre_entries e
      JOIN registres r ON r.id = e.registre_id
      WHERE e.id = registre_entry_documents.entry_id
      AND r.company_id = public.user_company_id()
    )
    AND public.user_role() IN ('admin', 'rh', 'manager')
  );

CREATE POLICY registre_entry_docs_delete ON registre_entry_documents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM registre_entries e
      JOIN registres r ON r.id = e.registre_id
      WHERE e.id = registre_entry_documents.entry_id
      AND r.company_id = public.user_company_id()
    )
    AND public.user_role() IN ('admin', 'rh')
  );
