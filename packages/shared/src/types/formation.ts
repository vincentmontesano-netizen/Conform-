/**
 * Types pour le module Formations & Habilitations (MODULE 4).
 *
 * Ce module ne duplique PAS les donnees des registres.
 * Il construit des vues croisees (matrice conformite) au-dessus
 * des registre_entries existantes (formations + habilitations).
 */

// ============================================================
// Formation Types (table de reference)
// ============================================================

export interface FormationType {
  id: string;
  company_id: string;
  code: string;
  name: string;
  category: 'formation' | 'habilitation';
  description: string | null;
  duree_validite_mois: number | null;
  norme: string | null;
  is_obligatoire: boolean;
  match_registre_type: 'formations' | 'habilitations';
  match_field_value: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Conformite Matrix
// ============================================================

/** Statut d'une cellule employee x formation_type */
export type ConformiteStatus = 'valid' | 'expiring' | 'expired' | 'missing';

/** Une cellule de la matrice de conformite */
export interface ConformiteCell {
  formation_type_id: string;
  formation_type_code: string;
  status: ConformiteStatus;
  /** ID de l'entree registre matchee (null si missing) */
  registre_entry_id: string | null;
  /** Date d'expiration calculee (null si missing ou validite illimitee) */
  expires_at: string | null;
  /** Jours restants avant expiration (null si missing ou illimite) */
  days_remaining: number | null;
  /** Date de la derniere formation/habilitation */
  last_date: string | null;
}

/** Une ligne = un employe avec toutes ses cellules */
export interface ConformiteRow {
  salarie_nom: string;
  salarie_poste: string | null;
  site_name: string | null;
  cells: ConformiteCell[];
  /** Nombre de types valides */
  valid_count: number;
  /** Nombre de types expirant (<= 30j) */
  expiring_count: number;
  /** Nombre de types expires */
  expired_count: number;
  /** Nombre de types manquants */
  missing_count: number;
  /** Score de conformite individuel (0-100) */
  score: number;
}

/** La matrice complete */
export interface ConformiteMatrix {
  /** Colonnes = les formation_types actifs */
  columns: FormationType[];
  /** Lignes = employes uniques */
  rows: ConformiteRow[];
  /** Statistiques globales */
  summary: ConformiteSummary;
}

export interface ConformiteSummary {
  total_employees: number;
  total_types: number;
  total_cells: number;
  valid_cells: number;
  expiring_cells: number;
  expired_cells: number;
  missing_cells: number;
  /** Score global de conformite (0-100) */
  global_score: number;
}

// ============================================================
// Formation Stats (KPIs)
// ============================================================

export interface FormationStats {
  /** Nombre total de salaries identifies */
  total_salaries: number;
  /** Nombre de formations/habilitations a jour */
  formations_valid: number;
  /** Nombre expirant dans les 30 jours */
  formations_expiring: number;
  /** Nombre expirees */
  formations_expired: number;
  /** Nombre d'habilitations a jour */
  habilitations_valid: number;
  /** Nombre d'habilitations expirant dans 30j */
  habilitations_expiring: number;
  /** Nombre d'habilitations expirees */
  habilitations_expired: number;
  /** Score global */
  global_score: number;
  /** Types obligatoires non couverts (count) */
  obligatoires_manquantes: number;
}

// ============================================================
// Rapport Inspection
// ============================================================

export interface FormationRapportData {
  company_name: string;
  generated_at: string;
  stats: FormationStats;
  matrix: ConformiteMatrix;
  formation_types: FormationType[];
}

// ============================================================
// Filters
// ============================================================

export interface ConformiteFilters {
  category?: 'formation' | 'habilitation';
  status?: ConformiteStatus;
  site_id?: string;
  search?: string;
  obligatoire_only?: boolean;
}
