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
