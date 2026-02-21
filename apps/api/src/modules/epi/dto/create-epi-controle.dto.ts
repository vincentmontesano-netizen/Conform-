export class CreateEpiControleDto {
  epi_item_id: string;
  date_controle: string;
  controleur: string;
  resultat: string;
  observations?: string;
  prochain_controle?: string;
}
