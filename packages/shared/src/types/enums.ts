export enum UserRole {
  ADMIN = 'admin',
  RH = 'rh',
  MANAGER = 'manager',
  INSPECTEUR = 'inspecteur',
}

export enum DuerpStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  PENDING_VALIDATION = 'pending_validation',
  VALIDATED = 'validated',
  ARCHIVED = 'archived',
}

export enum SeverityLevel {
  FAIBLE = 'faible',
  MODERE = 'modere',
  ELEVE = 'eleve',
  CRITIQUE = 'critique',
}

export enum ProbabilityLevel {
  IMPROBABLE = 'improbable',
  PEU_PROBABLE = 'peu_probable',
  PROBABLE = 'probable',
  TRES_PROBABLE = 'tres_probable',
}

export enum ActionPriority {
  FAIBLE = 'faible',
  MOYENNE = 'moyenne',
  HAUTE = 'haute',
  URGENTE = 'urgente',
}

export enum ActionStatus {
  A_FAIRE = 'a_faire',
  EN_COURS = 'en_cours',
  TERMINEE = 'terminee',
  ANNULEE = 'annulee',
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export enum DuerpTriggerType {
  CHANGEMENT_ORGANISATION = 'changement_organisation',
  ACCIDENT_TRAVAIL = 'accident_travail',
  EVOLUTION_POSTE = 'evolution_poste',
  NOUVELLE_REGLEMENTATION = 'nouvelle_reglementation',
  MISE_A_JOUR_ANNUELLE = 'mise_a_jour_annuelle',
  AUTRE = 'autre',
}

export enum ActionPlanCategory {
  PREVENTION = 'prevention',
  PROTECTION = 'protection',
  FORMATION = 'formation',
  INFORMATION = 'information',
  ORGANISATION = 'organisation',
}

export enum ActionPlanLogEventType {
  STATUS_CHANGE = 'status_change',
  COMMENT = 'comment',
  PROOF_UPLOADED = 'proof_uploaded',
  PROOF_REMOVED = 'proof_removed',
  FIELD_UPDATED = 'field_updated',
}

export enum RegistreType {
  RUP = 'rup',
  CONTROLES_SECURITE = 'controles_securite',
  ACCIDENTS_BENINS = 'accidents_benins',
  DANGERS_GRAVES = 'dangers_graves',
  FORMATIONS = 'formations',
  HABILITATIONS = 'habilitations',
  ERP_ICPE = 'erp_icpe',
  RGPD = 'rgpd',
}

// ============================================================
// EPI — Equipements de Protection Individuelle
// ============================================================

export enum EpiEtat {
  NEUF = 'neuf',
  BON = 'bon',
  USAGE = 'usage',
  A_REMPLACER = 'a_remplacer',
  RETIRE = 'retire',
}

export enum EpiStatut {
  EN_STOCK = 'en_stock',
  ATTRIBUE = 'attribue',
  EN_CONTROLE = 'en_controle',
  RETIRE = 'retire',
  PERDU = 'perdu',
}

export enum EpiControleResultat {
  CONFORME = 'conforme',
  NON_CONFORME = 'non_conforme',
  A_SURVEILLER = 'a_surveiller',
}
