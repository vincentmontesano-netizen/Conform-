/**
 * Modèle utilisateurs Conform+
 *
 * 1. USER TYPE (type principal)
 *    - client : utilisateur d'une entreprise cliente (accès selon rôle + plan)
 *    - admin  : super_admin plateforme (back-office /admin)
 *
 * 2. USER CLIENT — rôles (au sein d'une entreprise)
 *    - admin, rh, manager, inspecteur
 *
 * 3. USER CLIENT — classes / plans (accès aux modules)
 *    - basic     : Dashboard, Entreprises, DUERP, Registres, Alertes, Audit, Paramètres
 *    - pro       : basic + EPI, Formations
 *    - premium   : pro + (extensions futures)
 *    - enterprise: premium + (extensions futures)
 */

/** client = utilisateur entreprise | admin = super_admin plateforme (back-office /admin) */
export type UserType = 'client' | 'admin';

/** Plans d'abonnement par entreprise — détermine l'accès aux modules */
export type SubscriptionPlan = 'basic' | 'pro' | 'premium' | 'enterprise';

/** Modules de l'application */
export type AppModule =
  | 'dashboard'
  | 'companies'
  | 'duerp'
  | 'registres'
  | 'alerts'
  | 'audit_log'
  | 'settings'
  | 'epi'
  | 'formations'
  | 'chatbot';

export const USER_TYPE_LABELS: Record<UserType, string> = {
  client: 'Utilisateur client',
  admin: 'Administrateur plateforme',
};

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  basic: 'Basic',
  pro: 'Pro',
  premium: 'Premium',
  enterprise: 'Enterprise',
};

export const PLAN_DESCRIPTIONS: Record<SubscriptionPlan, string> = {
  basic: 'DUERP, Registres, Alertes — modules de base',
  pro: 'Basic + EPI, Formations',
  premium: 'Pro + fonctionnalités avancées',
  enterprise: 'Premium + support dédié, personnalisation',
};

/**
 * Mapping plan → modules accessibles
 * basic : modules inclus pour tous les plans payants
 * pro+  : EPI et Formations nécessitent Pro ou supérieur
 */
export const PLAN_MODULES: Record<SubscriptionPlan, AppModule[]> = {
  basic: [
    'dashboard',
    'companies',
    'duerp',
    'registres',
    'alerts',
    'audit_log',
    'settings',
    'chatbot',
  ],
  pro: [
    'dashboard',
    'companies',
    'duerp',
    'registres',
    'alerts',
    'audit_log',
    'settings',
    'chatbot',
    'epi',
    'formations',
  ],
  premium: [
    'dashboard',
    'companies',
    'duerp',
    'registres',
    'alerts',
    'audit_log',
    'settings',
    'chatbot',
    'epi',
    'formations',
  ],
  enterprise: [
    'dashboard',
    'companies',
    'duerp',
    'registres',
    'alerts',
    'audit_log',
    'settings',
    'chatbot',
    'epi',
    'formations',
  ],
};

/** Plans qui incluent les modules payants (EPI, Formations) */
export const PLANS_WITH_EPI_FORMATIONS: SubscriptionPlan[] = ['pro', 'premium', 'enterprise'];

export function planHasModule(plan: SubscriptionPlan, module: AppModule): boolean {
  return PLAN_MODULES[plan].includes(module);
}

export function isProOrHigher(plan: SubscriptionPlan): boolean {
  return PLANS_WITH_EPI_FORMATIONS.includes(plan);
}
