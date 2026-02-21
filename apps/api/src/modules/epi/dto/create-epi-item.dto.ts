export class CreateEpiItemDto {
  category_id: string;
  site_id?: string;
  reference?: string;
  taille?: string;
  date_achat?: string;
  date_fabrication?: string;
  date_expiration?: string;
  date_mise_en_service?: string;
  etat?: string;
  statut?: string;
  quantite?: number;
  notes?: string;
}

export class UpdateEpiItemDto {
  category_id?: string;
  site_id?: string;
  reference?: string;
  taille?: string;
  date_achat?: string;
  date_fabrication?: string;
  date_expiration?: string;
  date_mise_en_service?: string;
  date_dernier_controle?: string;
  date_prochain_controle?: string;
  etat?: string;
  statut?: string;
  quantite?: number;
  notes?: string;
}
