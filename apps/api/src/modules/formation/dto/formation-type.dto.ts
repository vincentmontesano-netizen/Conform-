export class CreateFormationTypeDto {
  code: string;
  name: string;
  category: 'formation' | 'habilitation';
  description?: string;
  duree_validite_mois?: number;
  norme?: string;
  is_obligatoire?: boolean;
  match_registre_type: 'formations' | 'habilitations';
  match_field_value: string;
}

export class UpdateFormationTypeDto {
  code?: string;
  name?: string;
  category?: 'formation' | 'habilitation';
  description?: string;
  duree_validite_mois?: number;
  norme?: string;
  is_obligatoire?: boolean;
  match_registre_type?: 'formations' | 'habilitations';
  match_field_value?: string;
  is_active?: boolean;
}
