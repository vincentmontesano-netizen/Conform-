export interface EpiCategoryPreset {
  name: string;
  code: string;
  description: string;
  norme: string;
  duree_vie_mois: number;
  controle_periodique_mois: number;
  icon: string;
  color: string;
}

/**
 * 10 categories predefinies d'EPI avec normes europeennes.
 * Utilisees pour l'initialisation rapide de l'inventaire.
 */
export const EPI_CATEGORY_PRESETS: EpiCategoryPreset[] = [
  {
    name: 'Protection de la tete',
    code: 'TETE',
    description: 'Casques de chantier et de securite',
    norme: 'EN 397',
    duree_vie_mois: 48,
    controle_periodique_mois: 12,
    icon: 'HardHat',
    color: 'yellow',
  },
  {
    name: 'Protection auditive',
    code: 'AUDIT',
    description: 'Bouchons d\'oreilles et casques anti-bruit',
    norme: 'EN 352',
    duree_vie_mois: 12,
    controle_periodique_mois: 6,
    icon: 'Ear',
    color: 'blue',
  },
  {
    name: 'Protection oculaire',
    code: 'OCULAIRE',
    description: 'Lunettes de protection et ecrans faciaux',
    norme: 'EN 166',
    duree_vie_mois: 36,
    controle_periodique_mois: 12,
    icon: 'Eye',
    color: 'cyan',
  },
  {
    name: 'Protection respiratoire',
    code: 'RESPI',
    description: 'Masques filtrants et appareils respiratoires',
    norme: 'EN 149',
    duree_vie_mois: 12,
    controle_periodique_mois: 6,
    icon: 'Wind',
    color: 'green',
  },
  {
    name: 'Protection des mains',
    code: 'MAINS',
    description: 'Gants de protection (anti-coupure, chimique, thermique)',
    norme: 'EN 388 / EN 374',
    duree_vie_mois: 6,
    controle_periodique_mois: 3,
    icon: 'Hand',
    color: 'orange',
  },
  {
    name: 'Protection des pieds',
    code: 'PIEDS',
    description: 'Chaussures et bottes de securite',
    norme: 'EN 20345',
    duree_vie_mois: 12,
    controle_periodique_mois: 6,
    icon: 'Footprints',
    color: 'brown',
  },
  {
    name: 'Protection antichute',
    code: 'ANTICHUTE',
    description: 'Harnais, longes et dispositifs antichute',
    norme: 'EN 361',
    duree_vie_mois: 60,
    controle_periodique_mois: 12,
    icon: 'ArrowDownToLine',
    color: 'red',
  },
  {
    name: 'Haute visibilite',
    code: 'HIVIS',
    description: 'Gilets, vestes et vetements haute visibilite',
    norme: 'EN 20471',
    duree_vie_mois: 12,
    controle_periodique_mois: 6,
    icon: 'Sparkles',
    color: 'lime',
  },
  {
    name: 'Vetements de protection',
    code: 'VETEMENTS',
    description: 'Combinaisons, tabliers et vetements de travail',
    norme: 'EN 340',
    duree_vie_mois: 24,
    controle_periodique_mois: 12,
    icon: 'Shirt',
    color: 'purple',
  },
  {
    name: 'Protection contre le bruit',
    code: 'BRUIT',
    description: 'Casques et protecteurs auditifs supra-auraux',
    norme: 'EN 352',
    duree_vie_mois: 12,
    controle_periodique_mois: 6,
    icon: 'Volume2',
    color: 'indigo',
  },
];

/** Labels francais pour les etats d'EPI */
export const EPI_ETAT_LABELS: Record<string, string> = {
  neuf: 'Neuf',
  bon: 'Bon etat',
  usage: 'Usage',
  a_remplacer: 'A remplacer',
  retire: 'Retire',
};

/** Labels francais pour les statuts d'EPI */
export const EPI_STATUT_LABELS: Record<string, string> = {
  en_stock: 'En stock',
  attribue: 'Attribue',
  en_controle: 'En controle',
  retire: 'Retire',
  perdu: 'Perdu',
};

/** Labels francais pour les resultats de controle */
export const EPI_CONTROLE_RESULTAT_LABELS: Record<string, string> = {
  conforme: 'Conforme',
  non_conforme: 'Non conforme',
  a_surveiller: 'A surveiller',
};
