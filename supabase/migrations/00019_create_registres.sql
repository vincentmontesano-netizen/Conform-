-- Migration: Create registres tables for MODULE 2 - Registres Obligatoires
-- Tables: registres (master), registre_entries (rows), registre_entry_documents (attachments)

-- Enum type de registre
CREATE TYPE registre_type AS ENUM (
  'rup',
  'controles_securite',
  'accidents_benins',
  'dangers_graves',
  'formations',
  'habilitations',
  'erp_icpe',
  'rgpd'
);

-- Table maitre : un registre par type par entreprise (ou par site)
CREATE TABLE registres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  site_id UUID REFERENCES sites(id),
  type registre_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index d'unicite au lieu d'une contrainte unique impossible avec COALESCE
CREATE UNIQUE INDEX registres_company_site_type_unq ON registres (company_id, COALESCE(site_id, '00000000-0000-0000-0000-000000000000'::uuid), type);

-- Entrees du registre (lignes)
CREATE TABLE registre_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registre_id UUID NOT NULL REFERENCES registres(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  expires_at DATE,
  is_archived BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Documents attaches aux entrees
CREATE TABLE registre_entry_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES registre_entries(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_registres_company ON registres(company_id);
CREATE INDEX idx_registres_type ON registres(company_id, type);
CREATE INDEX idx_registre_entries_registre ON registre_entries(registre_id);
CREATE INDEX idx_registre_entries_expires ON registre_entries(expires_at)
  WHERE expires_at IS NOT NULL AND is_archived = false;
CREATE INDEX idx_registre_entry_docs ON registre_entry_documents(entry_id);

-- updated_at triggers (reuse existing function)
CREATE TRIGGER update_registres_updated_at
  BEFORE UPDATE ON registres
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registre_entries_updated_at
  BEFORE UPDATE ON registre_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
