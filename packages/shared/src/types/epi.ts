import { EpiEtat, EpiStatut, EpiControleResultat } from './enums';

export interface EpiCategory {
  id: string;
  company_id: string;
  name: string;
  code: string | null;
  description: string | null;
  norme: string | null;
  duree_vie_mois: number | null;
  controle_periodique_mois: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EpiItem {
  id: string;
  company_id: string;
  site_id: string | null;
  category_id: string;
  reference: string | null;
  taille: string | null;
  date_achat: string | null;
  date_fabrication: string | null;
  date_expiration: string | null;
  date_mise_en_service: string | null;
  date_dernier_controle: string | null;
  date_prochain_controle: string | null;
  etat: EpiEtat;
  statut: EpiStatut;
  quantite: number;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined relations
  category?: EpiCategory;
  attributions?: EpiAttribution[];
  controles?: EpiControle[];
  documents?: EpiDocument[];
}

export interface EpiAttribution {
  id: string;
  epi_item_id: string;
  salarie_nom: string;
  salarie_poste: string | null;
  date_attribution: string;
  date_retour: string | null;
  motif: string | null;
  attribue_par: string;
  signature_salarie: boolean;
  notes: string | null;
  created_by: string;
  created_at: string;
  // Joined
  epi_item?: EpiItem;
}

export interface EpiControle {
  id: string;
  epi_item_id: string;
  date_controle: string;
  controleur: string;
  resultat: EpiControleResultat;
  observations: string | null;
  prochain_controle: string | null;
  created_by: string;
  created_at: string;
  // Joined
  epi_item?: EpiItem;
}

export interface EpiDocument {
  id: string;
  epi_item_id: string | null;
  epi_attribution_id: string | null;
  epi_controle_id: string | null;
  filename: string;
  url: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string;
  uploaded_at: string;
}
