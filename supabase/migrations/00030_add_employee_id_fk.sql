-- ============================================================
-- Ajout de employee_id sur les tables existantes
-- ============================================================
-- Lien entre la table employees et les modules EPI / Registres.
-- Les champs salarie_nom / salarie_poste sont conserves pour
-- compatibilite descendante (backward compat).

-- ─── epi_attributions ───────────────────────────────
ALTER TABLE epi_attributions
  ADD COLUMN employee_id UUID REFERENCES employees(id);

CREATE INDEX idx_epi_attributions_employee ON epi_attributions(employee_id)
  WHERE employee_id IS NOT NULL;

-- ─── registre_entries ───────────────────────────────
ALTER TABLE registre_entries
  ADD COLUMN employee_id UUID REFERENCES employees(id);

CREATE INDEX idx_registre_entries_employee ON registre_entries(employee_id)
  WHERE employee_id IS NOT NULL;

-- ─── Super admin bypass pour les nouvelles colonnes ─
-- (les policies existantes couvrent deja les tables,
--  on ajoute juste les index pour la perf)
