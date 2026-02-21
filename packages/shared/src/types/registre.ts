import { RegistreType } from './enums';

export interface Registre {
  id: string;
  company_id: string;
  site_id: string | null;
  type: RegistreType;
  name: string;
  description: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RegistreEntry {
  id: string;
  registre_id: string;
  data: Record<string, unknown>;
  expires_at: string | null;
  is_archived: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined
  documents?: RegistreEntryDocument[];
}

export interface RegistreEntryDocument {
  id: string;
  entry_id: string;
  filename: string;
  url: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string;
  uploaded_at: string;
}

/** Definition d'un champ de template pour la saisie guidee */
export interface RegistreFieldDef {
  name: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'number' | 'textarea' | 'boolean' | 'email';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { value: string; label: string }[];
}

/** Template complet d'un type de registre */
export interface RegistreTemplate {
  type: RegistreType;
  label: string;
  description: string;
  legalRef: string;
  icon: string;
  fields: RegistreFieldDef[];
  /** Nom du champ JSONB qui sert de date de peremption (copie dans expires_at) */
  expiryFieldName?: string;
  color: string;
}
