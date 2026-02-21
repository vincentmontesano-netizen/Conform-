export class CreateEpiCategoryDto {
  name: string;
  code?: string;
  description?: string;
  norme?: string;
  duree_vie_mois?: number;
  controle_periodique_mois?: number;
}

export class UpdateEpiCategoryDto {
  name?: string;
  code?: string;
  description?: string;
  norme?: string;
  duree_vie_mois?: number;
  controle_periodique_mois?: number;
  is_active?: boolean;
}
