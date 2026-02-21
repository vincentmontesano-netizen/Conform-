import { RegistreType } from '../types/enums';
import type { RegistreTemplate } from '../types/registre';

export const REGISTRE_TYPE_LABELS: Record<RegistreType, string> = {
  [RegistreType.RUP]: 'Registre unique du personnel',
  [RegistreType.CONTROLES_SECURITE]: 'Registre des controles de securite',
  [RegistreType.ACCIDENTS_BENINS]: 'Registre des accidents benins',
  [RegistreType.DANGERS_GRAVES]: 'Registre des dangers graves et imminents',
  [RegistreType.FORMATIONS]: 'Registre des formations obligatoires',
  [RegistreType.HABILITATIONS]: 'Registre des habilitations',
  [RegistreType.ERP_ICPE]: 'Registre ERP / ICPE',
  [RegistreType.RGPD]: 'Registre des traitements RGPD',
};

export const REGISTRE_TEMPLATES: Record<RegistreType, RegistreTemplate> = {
  // ──────────────────────────────────────────
  // 1. Registre unique du personnel
  // ──────────────────────────────────────────
  [RegistreType.RUP]: {
    type: RegistreType.RUP,
    label: 'Registre unique du personnel',
    description: 'Tenue obligatoire des entrees et sorties de tous les salaries, stagiaires et interimaires.',
    legalRef: 'Art. L1221-13 du Code du Travail',
    icon: 'Users',
    color: 'blue',
    fields: [
      { name: 'nom', label: 'Nom', type: 'text', required: true, placeholder: 'Dupont' },
      { name: 'prenom', label: 'Prenom', type: 'text', required: true, placeholder: 'Jean' },
      { name: 'date_naissance', label: 'Date de naissance', type: 'date', required: true },
      { name: 'sexe', label: 'Sexe', type: 'select', required: true, options: [
        { value: 'M', label: 'Masculin' },
        { value: 'F', label: 'Feminin' },
      ]},
      { name: 'nationalite', label: 'Nationalite', type: 'text', required: true, placeholder: 'Francaise' },
      { name: 'emploi', label: 'Emploi / Poste', type: 'text', required: true, placeholder: 'Technicien de maintenance', helpText: 'Intitule exact du poste occupe' },
      { name: 'qualification', label: 'Qualification', type: 'text', required: true, placeholder: 'Ouvrier qualifie P2', helpText: 'Niveau de qualification (ex: cadre, employe, ouvrier)' },
      { name: 'date_entree', label: 'Date d\'entree', type: 'date', required: true, helpText: 'Date de debut du contrat' },
      { name: 'date_sortie', label: 'Date de sortie', type: 'date', required: false, helpText: 'A remplir lors du depart du salarie' },
      { name: 'type_contrat', label: 'Type de contrat', type: 'select', required: true, options: [
        { value: 'cdi', label: 'CDI' },
        { value: 'cdd', label: 'CDD' },
        { value: 'interim', label: 'Interim' },
        { value: 'apprentissage', label: 'Apprentissage' },
        { value: 'professionnalisation', label: 'Contrat de professionnalisation' },
        { value: 'stage', label: 'Stage' },
      ]},
      { name: 'numero_titre_travail', label: 'N° titre de travail (etranger)', type: 'text', required: false, helpText: 'Obligatoire pour les salaries etrangers hors UE' },
      { name: 'mise_a_disposition', label: 'Entreprise de mise a disposition', type: 'text', required: false, helpText: 'Pour les interimaires : nom de l\'agence' },
    ],
  },

  // ──────────────────────────────────────────
  // 2. Registre controles securite
  // ──────────────────────────────────────────
  [RegistreType.CONTROLES_SECURITE]: {
    type: RegistreType.CONTROLES_SECURITE,
    label: 'Registre des controles de securite',
    description: 'Suivi des verifications periodiques des equipements de securite et installations.',
    legalRef: 'Art. R4224-17 du Code du Travail',
    icon: 'ShieldCheck',
    color: 'green',
    expiryFieldName: 'date_prochain_controle',
    fields: [
      { name: 'equipement', label: 'Equipement / Installation', type: 'text', required: true, placeholder: 'Extincteur batiment A', helpText: 'Identification precise de l\'equipement controle' },
      { name: 'localisation', label: 'Localisation', type: 'text', required: false, placeholder: 'Batiment A - RDC' },
      { name: 'type_controle', label: 'Type de controle', type: 'select', required: true, options: [
        { value: 'verification_periodique', label: 'Verification periodique' },
        { value: 'controle_reglementaire', label: 'Controle reglementaire' },
        { value: 'maintenance_preventive', label: 'Maintenance preventive' },
        { value: 'controle_initial', label: 'Controle initial / mise en service' },
      ]},
      { name: 'date_controle', label: 'Date du controle', type: 'date', required: true },
      { name: 'organisme', label: 'Organisme / Controleur', type: 'text', required: true, placeholder: 'Bureau Veritas', helpText: 'Nom de l\'organisme agree ou du controleur interne' },
      { name: 'resultat', label: 'Resultat', type: 'select', required: true, options: [
        { value: 'conforme', label: 'Conforme' },
        { value: 'non_conforme', label: 'Non conforme' },
        { value: 'avec_reserves', label: 'Conforme avec reserves' },
      ]},
      { name: 'observations', label: 'Observations', type: 'textarea', required: false, placeholder: 'Reserves ou remarques du controleur...' },
      { name: 'date_prochain_controle', label: 'Date prochain controle', type: 'date', required: false, helpText: 'Echeance de la prochaine verification obligatoire' },
    ],
  },

  // ──────────────────────────────────────────
  // 3. Registre accidents benins
  // ──────────────────────────────────────────
  [RegistreType.ACCIDENTS_BENINS]: {
    type: RegistreType.ACCIDENTS_BENINS,
    label: 'Registre des accidents benins',
    description: 'Enregistrement des accidents du travail n\'entrainant ni arret de travail ni soins medicaux.',
    legalRef: 'Art. L441-4 du Code de la Securite Sociale',
    icon: 'HeartPulse',
    color: 'orange',
    fields: [
      { name: 'date_accident', label: 'Date de l\'accident', type: 'date', required: true },
      { name: 'heure', label: 'Heure', type: 'text', required: true, placeholder: '14:30' },
      { name: 'lieu', label: 'Lieu de l\'accident', type: 'text', required: true, placeholder: 'Atelier production - Zone B' },
      { name: 'victime_nom', label: 'Nom de la victime', type: 'text', required: true, placeholder: 'Dupont Jean' },
      { name: 'victime_poste', label: 'Poste de la victime', type: 'text', required: false, placeholder: 'Operateur machine' },
      { name: 'description', label: 'Description de l\'accident', type: 'textarea', required: true, placeholder: 'Decrire les circonstances de l\'accident...', helpText: 'Circonstances detaillees, nature des lesions' },
      { name: 'nature_lesion', label: 'Nature de la lesion', type: 'text', required: true, placeholder: 'Coupure superficielle main droite' },
      { name: 'soins', label: 'Soins prodigues', type: 'textarea', required: true, placeholder: 'Desinfection + pansement', helpText: 'Nature des soins de premiere urgence' },
      { name: 'temoin', label: 'Temoin(s)', type: 'text', required: false, placeholder: 'Martin Pierre' },
      { name: 'signature_victime', label: 'Signature de la victime', type: 'boolean', required: false, helpText: 'Cocher si la victime a signe le registre' },
    ],
  },

  // ──────────────────────────────────────────
  // 4. Registre dangers graves et imminents
  // ──────────────────────────────────────────
  [RegistreType.DANGERS_GRAVES]: {
    type: RegistreType.DANGERS_GRAVES,
    label: 'Registre des dangers graves et imminents',
    description: 'Signalement des situations de danger grave et imminent par les salaries ou le CSE.',
    legalRef: 'Art. D4132-1 du Code du Travail',
    icon: 'AlertOctagon',
    color: 'red',
    fields: [
      { name: 'date_signalement', label: 'Date du signalement', type: 'date', required: true },
      { name: 'heure_signalement', label: 'Heure du signalement', type: 'text', required: false, placeholder: '09:15' },
      { name: 'signale_par', label: 'Signale par', type: 'text', required: true, placeholder: 'Nom du salarie ou representant CSE', helpText: 'Identite de la personne signalant le danger' },
      { name: 'qualite_signalataire', label: 'Qualite', type: 'select', required: true, options: [
        { value: 'salarie', label: 'Salarie' },
        { value: 'representant_cse', label: 'Representant CSE' },
        { value: 'delegue_personnel', label: 'Delegue du personnel' },
      ]},
      { name: 'poste_concerne', label: 'Poste(s) de travail concerne(s)', type: 'text', required: true, placeholder: 'Atelier soudure' },
      { name: 'nature_danger', label: 'Nature du danger', type: 'textarea', required: true, placeholder: 'Decrire la nature precise du danger...', helpText: 'Description detaillee du danger identifie' },
      { name: 'cause_danger', label: 'Cause supposee', type: 'textarea', required: false, placeholder: 'Cause identifiee du danger...' },
      { name: 'mesures_prises', label: 'Mesures prises par l\'employeur', type: 'textarea', required: false, placeholder: 'Arret de la machine, evacuation...' },
      { name: 'date_resolution', label: 'Date de resolution', type: 'date', required: false, helpText: 'Date a laquelle le danger a ete elimine' },
      { name: 'droit_retrait_exerce', label: 'Droit de retrait exerce', type: 'boolean', required: false, helpText: 'Le salarie a-t-il exerce son droit de retrait ?' },
    ],
  },

  // ──────────────────────────────────────────
  // 5. Registre formations obligatoires
  // ──────────────────────────────────────────
  [RegistreType.FORMATIONS]: {
    type: RegistreType.FORMATIONS,
    label: 'Registre des formations obligatoires',
    description: 'Suivi des formations en matiere de sante et securite au travail.',
    legalRef: 'Art. L4141-1 a L4141-4 du Code du Travail',
    icon: 'GraduationCap',
    color: 'purple',
    expiryFieldName: 'date_validite',
    fields: [
      { name: 'salarie_nom', label: 'Nom du salarie', type: 'text', required: true, placeholder: 'Dupont Jean' },
      { name: 'salarie_poste', label: 'Poste occupe', type: 'text', required: false, placeholder: 'Technicien' },
      { name: 'intitule', label: 'Intitule de la formation', type: 'text', required: true, placeholder: 'Formation SST - Sauveteur Secouriste du Travail', helpText: 'Intitule complet de la formation' },
      { name: 'type_formation', label: 'Type de formation', type: 'select', required: true, options: [
        { value: 'initiale', label: 'Formation initiale' },
        { value: 'recyclage', label: 'Recyclage / Maintien des acquis' },
        { value: 'adaptation_poste', label: 'Adaptation au poste' },
        { value: 'habilitation', label: 'Formation habilitante' },
      ]},
      { name: 'organisme', label: 'Organisme de formation', type: 'text', required: true, placeholder: 'INRS, AFTRAL, etc.' },
      { name: 'date_debut', label: 'Date de debut', type: 'date', required: true },
      { name: 'date_fin', label: 'Date de fin', type: 'date', required: true },
      { name: 'duree_heures', label: 'Duree (heures)', type: 'number', required: false, placeholder: '14' },
      { name: 'date_validite', label: 'Date de validite', type: 'date', required: false, helpText: 'Date d\'expiration de la formation (si recyclage obligatoire)' },
      { name: 'attestation', label: 'Attestation recue', type: 'boolean', required: false, helpText: 'L\'attestation de formation a-t-elle ete recue ?' },
    ],
  },

  // ──────────────────────────────────────────
  // 6. Registre habilitations
  // ──────────────────────────────────────────
  [RegistreType.HABILITATIONS]: {
    type: RegistreType.HABILITATIONS,
    label: 'Registre des habilitations',
    description: 'Suivi des habilitations et autorisations professionnelles (electrique, CACES, SST...).',
    legalRef: 'Art. R4544-9 (electrique), Art. R4323-56 (CACES)',
    icon: 'BadgeCheck',
    color: 'indigo',
    expiryFieldName: 'date_expiration',
    fields: [
      { name: 'salarie_nom', label: 'Nom du salarie', type: 'text', required: true, placeholder: 'Martin Pierre' },
      { name: 'salarie_poste', label: 'Poste', type: 'text', required: false, placeholder: 'Electricien' },
      { name: 'type_habilitation', label: 'Type d\'habilitation', type: 'select', required: true, options: [
        { value: 'electrique', label: 'Habilitation electrique' },
        { value: 'caces', label: 'CACES' },
        { value: 'sst', label: 'SST (Sauveteur Secouriste du Travail)' },
        { value: 'amiante', label: 'Amiante sous-section 3/4' },
        { value: 'travail_hauteur', label: 'Travail en hauteur' },
        { value: 'conduite_engins', label: 'Conduite d\'engins' },
        { value: 'atex', label: 'ATEX (atmospheres explosives)' },
        { value: 'autre', label: 'Autre' },
      ]},
      { name: 'niveau', label: 'Niveau / Symbole', type: 'text', required: true, placeholder: 'B1V, CACES R489 cat.3...', helpText: 'Niveau d\'habilitation ou categorie' },
      { name: 'organisme', label: 'Organisme certificateur', type: 'text', required: true, placeholder: 'APAVE, SOCOTEC...' },
      { name: 'date_obtention', label: 'Date d\'obtention', type: 'date', required: true },
      { name: 'date_expiration', label: 'Date d\'expiration', type: 'date', required: true, helpText: 'Date de fin de validite de l\'habilitation' },
      { name: 'numero', label: 'Numero de certificat', type: 'text', required: false, placeholder: 'HAB-2024-00123' },
      { name: 'restrictions', label: 'Restrictions / Conditions', type: 'textarea', required: false, placeholder: 'Conditions particulieres, limitations...' },
    ],
  },

  // ──────────────────────────────────────────
  // 7. Registre ERP / ICPE
  // ──────────────────────────────────────────
  [RegistreType.ERP_ICPE]: {
    type: RegistreType.ERP_ICPE,
    label: 'Registre ERP / ICPE',
    description: 'Registre de securite pour les Etablissements Recevant du Public et Installations Classees.',
    legalRef: 'Art. R123-51 du Code de la Construction (ERP) / Art. R512-46-24 (ICPE)',
    icon: 'Building',
    color: 'teal',
    expiryFieldName: 'date_prochain_controle',
    fields: [
      { name: 'categorie', label: 'Categorie d\'etablissement', type: 'select', required: true, options: [
        { value: 'erp', label: 'ERP (Etablissement Recevant du Public)' },
        { value: 'icpe', label: 'ICPE (Installation Classee)' },
      ]},
      { name: 'type_controle', label: 'Type de controle / Verification', type: 'select', required: true, options: [
        { value: 'commission_securite', label: 'Commission de securite' },
        { value: 'verification_electrique', label: 'Verification electrique' },
        { value: 'verification_incendie', label: 'Verification systeme incendie' },
        { value: 'verification_gaz', label: 'Verification gaz' },
        { value: 'verification_ascenseurs', label: 'Verification ascenseurs' },
        { value: 'exercice_evacuation', label: 'Exercice d\'evacuation' },
        { value: 'controle_icpe', label: 'Controle DREAL/ICPE' },
        { value: 'autre', label: 'Autre' },
      ]},
      { name: 'date_controle', label: 'Date du controle', type: 'date', required: true },
      { name: 'organisme', label: 'Organisme / Commission', type: 'text', required: true, placeholder: 'Commission departementale de securite' },
      { name: 'conformite', label: 'Avis / Resultat', type: 'select', required: true, options: [
        { value: 'favorable', label: 'Avis favorable' },
        { value: 'defavorable', label: 'Avis defavorable' },
        { value: 'favorable_reserves', label: 'Favorable avec reserves' },
        { value: 'conforme', label: 'Conforme' },
        { value: 'non_conforme', label: 'Non conforme' },
      ]},
      { name: 'observations', label: 'Observations / Prescriptions', type: 'textarea', required: false, placeholder: 'Prescriptions de la commission, reserves...' },
      { name: 'travaux_realises', label: 'Travaux realises suite au controle', type: 'textarea', required: false, placeholder: 'Description des travaux corrective...' },
      { name: 'date_prochain_controle', label: 'Date prochain controle', type: 'date', required: false },
    ],
  },

  // ──────────────────────────────────────────
  // 8. Registre RGPD
  // ──────────────────────────────────────────
  [RegistreType.RGPD]: {
    type: RegistreType.RGPD,
    label: 'Registre des traitements RGPD',
    description: 'Registre des activites de traitement des donnees a caractere personnel.',
    legalRef: 'Art. 30 du RGPD (Reglement UE 2016/679)',
    icon: 'Lock',
    color: 'slate',
    fields: [
      { name: 'nom_traitement', label: 'Nom du traitement', type: 'text', required: true, placeholder: 'Gestion de la paie', helpText: 'Nom identifiant l\'activite de traitement' },
      { name: 'responsable', label: 'Responsable du traitement', type: 'text', required: true, placeholder: 'Direction des Ressources Humaines' },
      { name: 'finalite', label: 'Finalite(s) du traitement', type: 'textarea', required: true, placeholder: 'Gestion des salaires, declarations sociales, suivi des conges...', helpText: 'Objectif(s) poursuivi(s) par le traitement' },
      { name: 'base_legale', label: 'Base legale', type: 'select', required: true, options: [
        { value: 'consentement', label: 'Consentement' },
        { value: 'contrat', label: 'Execution d\'un contrat' },
        { value: 'obligation_legale', label: 'Obligation legale' },
        { value: 'interet_vital', label: 'Interet vital' },
        { value: 'mission_publique', label: 'Mission d\'interet public' },
        { value: 'interet_legitime', label: 'Interet legitime' },
      ]},
      { name: 'categories_personnes', label: 'Categories de personnes concernees', type: 'textarea', required: true, placeholder: 'Salaries, candidats, clients, fournisseurs...' },
      { name: 'categories_donnees', label: 'Categories de donnees collectees', type: 'textarea', required: true, placeholder: 'Identite, coordonnees, donnees bancaires, donnees de sante...', helpText: 'Types de donnees personnelles traitees' },
      { name: 'donnees_sensibles', label: 'Donnees sensibles', type: 'boolean', required: false, helpText: 'Le traitement concerne-t-il des donnees de sante, origine ethnique, opinions politiques, etc. ?' },
      { name: 'destinataires', label: 'Destinataires', type: 'textarea', required: true, placeholder: 'Service paie interne, URSSAF, organismes sociaux...', helpText: 'Qui a acces aux donnees ?' },
      { name: 'duree_conservation', label: 'Duree de conservation', type: 'text', required: true, placeholder: '5 ans apres le depart du salarie', helpText: 'Duree pendant laquelle les donnees sont conservees' },
      { name: 'mesures_securite', label: 'Mesures de securite', type: 'textarea', required: true, placeholder: 'Chiffrement, controle d\'acces, sauvegarde...', helpText: 'Mesures techniques et organisationnelles pour proteger les donnees' },
      { name: 'transfert_hors_ue', label: 'Transfert hors UE', type: 'boolean', required: false, helpText: 'Les donnees sont-elles transferees en dehors de l\'Union Europeenne ?' },
      { name: 'pays_transfert', label: 'Pays de transfert', type: 'text', required: false, placeholder: 'Etats-Unis (Clauses Contractuelles Types)', helpText: 'Si transfert hors UE, preciser le pays et les garanties' },
    ],
  },
};

export function getRegistreTemplate(type: RegistreType): RegistreTemplate {
  return REGISTRE_TEMPLATES[type];
}
