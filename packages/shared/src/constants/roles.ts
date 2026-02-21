import { UserRole } from '../types/enums.js';

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrateur',
  [UserRole.RH]: 'Ressources Humaines',
  [UserRole.MANAGER]: 'Manager',
  [UserRole.INSPECTEUR]: 'Inspecteur',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Configuration globale, gestion des utilisateurs et entreprises',
  [UserRole.RH]: 'Gestion du personnel, DUERP, formations',
  [UserRole.MANAGER]: 'Suivi operationnel des sites',
  [UserRole.INSPECTEUR]: 'Consultation en lecture seule pour audits',
};

export const WRITE_ROLES = [UserRole.ADMIN, UserRole.RH, UserRole.MANAGER] as const;
export const VALIDATE_ROLES = [UserRole.ADMIN, UserRole.RH] as const;
export const ADMIN_ROLES = [UserRole.ADMIN] as const;
