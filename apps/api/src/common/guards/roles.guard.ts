import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, ALLOW_WHEN_NO_COMPANY_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowWhenNoCompany = this.reflector.getAllAndOverride<boolean>(
      ALLOW_WHEN_NO_COMPANY_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    // Permet la création de première entreprise sans vérifier le rôle
    if (allowWhenNoCompany && !user?.company_id) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    if (!user?.role) {
      throw new ForbiddenException('Role non defini');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Acces refuse pour ce role');
    }

    return true;
  }
}
