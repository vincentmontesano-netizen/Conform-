import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const ALLOW_WHEN_NO_COMPANY_KEY = 'allowWhenNoCompany';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/** Autorise l'action quand l'utilisateur n'a pas encore d'entreprise (première création) */
export const AllowWhenNoCompany = () => SetMetadata(ALLOW_WHEN_NO_COMPANY_KEY, true);
