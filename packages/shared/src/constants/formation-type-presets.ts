export interface FormationTypePreset {
  code: string;
  name: string;
  category: 'formation' | 'habilitation';
  description: string;
  duree_validite_mois: number;
  norme: string;
  is_obligatoire: boolean;
  match_registre_type: 'formations' | 'habilitations';
  match_field_value: string;
  icon: string;
  color: string;
}

/**
 * 12 types de formation/habilitation predefinies conformes au Code du Travail.
 * Utilisees pour l'initialisation rapide de la table formation_types.
 *
 * match_registre_type : le type de registre ou trouver les entrees
 * match_field_value : la valeur a matcher dans le JSONB data
 *   - Pour 'habilitations' : match sur data->>'type_habilitation'
 *   - Pour 'formations' : match sur data->>'intitule' (recherche partielle)
 */
export const FORMATION_TYPE_PRESETS: FormationTypePreset[] = [
  // ─── Formations ────────────────────────────────────
  {
    code: 'SST',
    name: 'Sauveteur Secouriste du Travail',
    category: 'formation',
    description: 'Formation aux premiers secours en entreprise. Recyclage tous les 24 mois.',
    duree_validite_mois: 24,
    norme: 'Art. R4224-15 CT',
    is_obligatoire: true,
    match_registre_type: 'habilitations',
    match_field_value: 'sst',
    icon: 'HeartPulse',
    color: 'red',
  },
  {
    code: 'INCENDIE',
    name: 'Incendie et evacuation',
    category: 'formation',
    description: 'Formation a la securite incendie, manipulation des extincteurs et evacuation.',
    duree_validite_mois: 12,
    norme: 'Art. R4227-39 CT',
    is_obligatoire: true,
    match_registre_type: 'formations',
    match_field_value: 'incendie',
    icon: 'Flame',
    color: 'orange',
  },
  {
    code: 'PRAP',
    name: 'Prevention des Risques lies a l\'Activite Physique',
    category: 'formation',
    description: 'Formation gestes et postures, prevention des TMS.',
    duree_validite_mois: 24,
    norme: 'Art. L4121-1 CT',
    is_obligatoire: false,
    match_registre_type: 'formations',
    match_field_value: 'prap',
    icon: 'Activity',
    color: 'green',
  },
  {
    code: 'ACCUEIL_SECU',
    name: 'Accueil securite',
    category: 'formation',
    description: 'Formation a la securite lors de l\'embauche ou du changement de poste.',
    duree_validite_mois: 0,
    norme: 'Art. L4141-2 CT',
    is_obligatoire: true,
    match_registre_type: 'formations',
    match_field_value: 'accueil',
    icon: 'UserCheck',
    color: 'blue',
  },

  // ─── Habilitations ────────────────────────────────
  {
    code: 'HABILITATION_ELEC',
    name: 'Habilitation electrique',
    category: 'habilitation',
    description: 'Habilitation electrique (B0, B1V, B2V, BR, BC, H0...). Recyclage tous les 3 ans.',
    duree_validite_mois: 36,
    norme: 'Art. R4544-9 CT / NF C18-510',
    is_obligatoire: true,
    match_registre_type: 'habilitations',
    match_field_value: 'electrique',
    icon: 'Zap',
    color: 'yellow',
  },
  {
    code: 'CACES_R489',
    name: 'CACES R489 (Chariots automoteurs)',
    category: 'habilitation',
    description: 'Conduite de chariots elevateurs a conducteur porte. Validite 5 ans.',
    duree_validite_mois: 60,
    norme: 'Art. R4323-56 CT',
    is_obligatoire: false,
    match_registre_type: 'habilitations',
    match_field_value: 'caces',
    icon: 'Truck',
    color: 'orange',
  },
  {
    code: 'CACES_R482',
    name: 'CACES R482 (Engins de chantier)',
    category: 'habilitation',
    description: 'Conduite d\'engins de chantier. Validite 10 ans (5 ans cat. G).',
    duree_validite_mois: 120,
    norme: 'Art. R4323-56 CT',
    is_obligatoire: false,
    match_registre_type: 'habilitations',
    match_field_value: 'conduite_engins',
    icon: 'HardHat',
    color: 'amber',
  },
  {
    code: 'CACES_R486',
    name: 'CACES R486 (PEMP - Nacelles)',
    category: 'habilitation',
    description: 'Conduite de plateformes elevatrices mobiles de personnel. Validite 5 ans.',
    duree_validite_mois: 60,
    norme: 'Art. R4323-56 CT',
    is_obligatoire: false,
    match_registre_type: 'habilitations',
    match_field_value: 'caces',
    icon: 'ArrowUpFromLine',
    color: 'cyan',
  },
  {
    code: 'AMIANTE_SS3',
    name: 'Amiante sous-section 3',
    category: 'habilitation',
    description: 'Intervention sur materiaux contenant de l\'amiante. Recyclage tous les 3 ans.',
    duree_validite_mois: 36,
    norme: 'Art. R4412-94 CT',
    is_obligatoire: true,
    match_registre_type: 'habilitations',
    match_field_value: 'amiante',
    icon: 'AlertTriangle',
    color: 'red',
  },
  {
    code: 'AMIANTE_SS4',
    name: 'Amiante sous-section 4',
    category: 'habilitation',
    description: 'Interventions susceptibles de provoquer l\'emission de fibres d\'amiante.',
    duree_validite_mois: 36,
    norme: 'Art. R4412-117 CT',
    is_obligatoire: true,
    match_registre_type: 'habilitations',
    match_field_value: 'amiante',
    icon: 'AlertTriangle',
    color: 'red',
  },
  {
    code: 'TRAVAIL_HAUTEUR',
    name: 'Travail en hauteur',
    category: 'habilitation',
    description: 'Formation a l\'utilisation des equipements de protection contre les chutes.',
    duree_validite_mois: 12,
    norme: 'Art. R4323-89 CT',
    is_obligatoire: true,
    match_registre_type: 'habilitations',
    match_field_value: 'travail_hauteur',
    icon: 'ArrowDownToLine',
    color: 'purple',
  },
  {
    code: 'ATEX',
    name: 'ATEX (Atmospheres explosives)',
    category: 'habilitation',
    description: 'Formation au risque d\'explosion en atmospheres explosives.',
    duree_validite_mois: 36,
    norme: 'Art. R4227-49 CT',
    is_obligatoire: false,
    match_registre_type: 'habilitations',
    match_field_value: 'atex',
    icon: 'Bomb',
    color: 'indigo',
  },
];

/** Labels francais pour les categories */
export const FORMATION_CATEGORY_LABELS: Record<string, string> = {
  formation: 'Formation',
  habilitation: 'Habilitation',
};
