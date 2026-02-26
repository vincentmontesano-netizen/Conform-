import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/**
 * Guard qui exige le rôle super_admin (admin plateforme).
 * À utiliser sur les routes /admin/*.
 * Doit être utilisé après SupabaseAuthGuard.
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentification requise');
    }

    if (user.role !== 'super_admin') {
      throw new ForbiddenException('Accès réservé aux administrateurs plateforme');
    }

    return true;
  }
}
