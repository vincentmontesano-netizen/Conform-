-- ============================================================
-- TABLE EMPLOYEES : Gestion des salaries de l'entreprise
-- ============================================================
-- Entite de reference pour croiser les modules EPI, Formations,
-- Registres et le moteur de conformite.

-- Enum type de contrat
CREATE TYPE contrat_type AS ENUM ('cdi', 'cdd', 'interim', 'apprenti', 'stage', 'autre');

-- ============================================================
-- Table : employees
-- ============================================================
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id),

  -- Identite
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT,
  telephone TEXT,

  -- Poste
  poste TEXT,
  departement TEXT,

  -- Contrat
  date_entree DATE NOT NULL,
  date_sortie DATE,
  type_contrat contrat_type NOT NULL DEFAULT 'cdi',

  -- Etat
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_employees_site ON employees(site_id);
CREATE INDEX idx_employees_active ON employees(company_id) WHERE is_active = true;
CREATE INDEX idx_employees_nom ON employees(company_id, nom, prenom);

-- ============================================================
-- Trigger updated_at
-- ============================================================
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- SELECT : tous les utilisateurs de l'entreprise
CREATE POLICY employees_select ON employees
  FOR SELECT USING (company_id = public.user_company_id());

-- INSERT : admin, rh, manager
CREATE POLICY employees_insert ON employees
  FOR INSERT WITH CHECK (
    company_id = public.user_company_id()
    AND public.user_role() IN ('admin', 'rh', 'manager')
  );

-- UPDATE : admin, rh, manager
CREATE POLICY employees_update ON employees
  FOR UPDATE USING (
    company_id = public.user_company_id()
    AND public.user_role() IN ('admin', 'rh', 'manager')
  );

-- DELETE : admin, rh uniquement
CREATE POLICY employees_delete ON employees
  FOR DELETE USING (
    company_id = public.user_company_id()
    AND public.user_role() IN ('admin', 'rh')
  );
