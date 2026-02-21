-- ============================================================
-- MODULE 4 : Types de formation / habilitation (table de reference)
-- ============================================================

-- Table des types de formation et d'habilitation
-- Sert de reference pour la matrice de conformite par salarie.
-- Les donnees reelles sont dans registre_entries (formations + habilitations).

CREATE TABLE formation_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Identification
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('formation', 'habilitation')),
  description TEXT,

  -- Reglementation
  duree_validite_mois INTEGER,
  norme TEXT,
  is_obligatoire BOOLEAN NOT NULL DEFAULT false,

  -- Matching avec les registre_entries
  -- match_registre_type : 'formations' ou 'habilitations' (le type du registre)
  -- match_field_value : la valeur a chercher dans le JSONB data
  --   Pour habilitations : match contre data->>'type_habilitation'
  --   Pour formations : match contre data->>'type_formation' OU data->>'intitule' (contient)
  match_registre_type TEXT NOT NULL CHECK (match_registre_type IN ('formations', 'habilitations')),
  match_field_value TEXT NOT NULL,

  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Unicite par entreprise
  UNIQUE(company_id, code)
);

-- ─── Indexes ─────────────────────────────────────────
CREATE INDEX idx_formation_types_company ON formation_types(company_id);
CREATE INDEX idx_formation_types_category ON formation_types(company_id, category);
CREATE INDEX idx_formation_types_active ON formation_types(company_id) WHERE is_active = true;

-- ─── Trigger updated_at ──────────────────────────────
CREATE TRIGGER update_formation_types_updated_at
  BEFORE UPDATE ON formation_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── RLS ─────────────────────────────────────────────
ALTER TABLE formation_types ENABLE ROW LEVEL SECURITY;

-- SELECT : tous les utilisateurs de l'entreprise
CREATE POLICY formation_types_select ON formation_types
  FOR SELECT USING (company_id = public.user_company_id());

-- INSERT : admin, rh, manager
CREATE POLICY formation_types_insert ON formation_types
  FOR INSERT WITH CHECK (
    company_id = public.user_company_id()
    AND public.user_role() IN ('admin', 'rh', 'manager')
  );

-- UPDATE : admin, rh, manager
CREATE POLICY formation_types_update ON formation_types
  FOR UPDATE USING (
    company_id = public.user_company_id()
    AND public.user_role() IN ('admin', 'rh', 'manager')
  );

-- DELETE : admin, rh uniquement
CREATE POLICY formation_types_delete ON formation_types
  FOR DELETE USING (
    company_id = public.user_company_id()
    AND public.user_role() IN ('admin', 'rh')
  );
