/**
 * Types pour la gestion des salaries (entite de reference cross-module).
 */

export type ContratType = 'cdi' | 'cdd' | 'interim' | 'apprenti' | 'stage' | 'autre';

export interface Employee {
  id: string;
  company_id: string;
  site_id: string | null;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  poste: string | null;
  departement: string | null;
  date_entree: string;
  date_sortie: string | null;
  type_contrat: ContratType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  sites?: { id: string; name: string } | null;
}

export interface EmployeeWithRelations extends Employee {
  epi_attributions: any[];
  registre_entries: any[];
}

export interface EmployeeSearchResult {
  id: string;
  nom: string;
  prenom: string;
  poste: string | null;
  site_id: string | null;
}

export interface EmployeeStats {
  total: number;
  active: number;
  inactive: number;
  by_contrat: Record<string, number>;
}

export interface EmployeeFilters {
  search?: string;
  site_id?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateEmployeeInput {
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  poste?: string;
  departement?: string;
  date_entree: string;
  date_sortie?: string;
  type_contrat?: ContratType;
  site_id?: string;
}

export interface UpdateEmployeeInput {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  poste?: string;
  departement?: string;
  date_entree?: string;
  date_sortie?: string;
  type_contrat?: ContratType;
  site_id?: string;
  is_active?: boolean;
}

export const CONTRAT_TYPE_LABELS: Record<ContratType, string> = {
  cdi: 'CDI',
  cdd: 'CDD',
  interim: 'Interim',
  apprenti: 'Apprentissage',
  stage: 'Stage',
  autre: 'Autre',
};
