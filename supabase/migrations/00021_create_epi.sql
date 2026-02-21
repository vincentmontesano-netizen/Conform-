-- ============================================================
-- MODULE 3 : GESTION EPI (Equipements de Protection Individuelle)
-- ============================================================

-- Enums
CREATE TYPE epi_etat AS ENUM ('neuf', 'bon', 'usage', 'a_remplacer', 'retire');
CREATE TYPE epi_statut AS ENUM ('en_stock', 'attribue', 'en_controle', 'retire', 'perdu');
CREATE TYPE epi_controle_resultat AS ENUM ('conforme', 'non_conforme', 'a_surveiller');

-- ============================================================
-- Table : epi_categories
-- Categories / types d'EPI avec normes et durees de vie
-- ============================================================
CREATE TABLE epi_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  norme TEXT,
  duree_vie_mois INTEGER,
  controle_periodique_mois INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Table : epi_items
-- Inventaire des EPI individuels
-- ============================================================
CREATE TABLE epi_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id),
  category_id UUID NOT NULL REFERENCES epi_categories(id),
  reference TEXT,
  taille TEXT,
  date_achat DATE,
  date_fabrication DATE,
  date_expiration DATE,
  date_mise_en_service DATE,
  date_dernier_controle DATE,
  date_prochain_controle DATE,
  etat epi_etat NOT NULL DEFAULT 'neuf',
  statut epi_statut NOT NULL DEFAULT 'en_stock',
  quantite INTEGER DEFAULT 1,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Table : epi_attributions
-- Historique des attributions d'EPI aux salaries
-- ============================================================
CREATE TABLE epi_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epi_item_id UUID NOT NULL REFERENCES epi_items(id) ON DELETE CASCADE,
  salarie_nom TEXT NOT NULL,
  salarie_poste TEXT,
  date_attribution DATE NOT NULL,
  date_retour DATE,
  motif TEXT,
  attribue_par TEXT NOT NULL,
  signature_salarie BOOLEAN DEFAULT false,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Table : epi_controles
-- Controles periodiques des EPI
-- ============================================================
CREATE TABLE epi_controles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epi_item_id UUID NOT NULL REFERENCES epi_items(id) ON DELETE CASCADE,
  date_controle DATE NOT NULL,
  controleur TEXT NOT NULL,
  resultat epi_controle_resultat NOT NULL,
  observations TEXT,
  prochain_controle DATE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Table : epi_documents
-- Documents attaches (attestations, photos, certificats)
-- ============================================================
CREATE TABLE epi_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epi_item_id UUID REFERENCES epi_items(id) ON DELETE CASCADE,
  epi_attribution_id UUID REFERENCES epi_attributions(id) ON DELETE CASCADE,
  epi_controle_id UUID REFERENCES epi_controles(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT epi_docs_at_least_one_parent CHECK (
    epi_item_id IS NOT NULL OR epi_attribution_id IS NOT NULL OR epi_controle_id IS NOT NULL
  )
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_epi_categories_company ON epi_categories(company_id);
CREATE INDEX idx_epi_items_company ON epi_items(company_id);
CREATE INDEX idx_epi_items_category ON epi_items(category_id);
CREATE INDEX idx_epi_items_statut ON epi_items(company_id, statut);
CREATE INDEX idx_epi_items_expiration ON epi_items(date_expiration) WHERE date_expiration IS NOT NULL;
CREATE INDEX idx_epi_items_prochain_controle ON epi_items(date_prochain_controle) WHERE date_prochain_controle IS NOT NULL;
CREATE INDEX idx_epi_attributions_item ON epi_attributions(epi_item_id);
CREATE INDEX idx_epi_attributions_salarie ON epi_attributions(salarie_nom);
CREATE INDEX idx_epi_controles_item ON epi_controles(epi_item_id);
CREATE INDEX idx_epi_documents_item ON epi_documents(epi_item_id);
CREATE INDEX idx_epi_documents_attribution ON epi_documents(epi_attribution_id);
CREATE INDEX idx_epi_documents_controle ON epi_documents(epi_controle_id);

-- ============================================================
-- Triggers updated_at (reutilise la fonction existante)
-- ============================================================
CREATE TRIGGER update_epi_categories_updated_at
  BEFORE UPDATE ON epi_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_epi_items_updated_at
  BEFORE UPDATE ON epi_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
