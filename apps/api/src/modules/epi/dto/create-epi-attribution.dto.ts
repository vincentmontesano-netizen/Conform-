export class CreateEpiAttributionDto {
  epi_item_id: string;
  salarie_nom: string;
  salarie_poste?: string;
  date_attribution: string;
  date_retour?: string;
  motif?: string;
  attribue_par: string;
  signature_salarie?: boolean;
  notes?: string;
}

export class UpdateEpiAttributionDto {
  date_retour?: string;
  motif?: string;
  signature_salarie?: boolean;
  notes?: string;
}
