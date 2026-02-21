export class CreateDuerpTriggerDto {
  trigger_type: 'changement_organisation' | 'accident_travail' | 'evolution_poste' | 'nouvelle_reglementation' | 'mise_a_jour_annuelle' | 'autre';
  title: string;
  description?: string;
  occurred_at?: string;
  duerp_id?: string;
}
