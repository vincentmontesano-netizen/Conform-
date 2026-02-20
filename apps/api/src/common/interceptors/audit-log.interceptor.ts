import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly supabaseService: SupabaseService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          const client = this.supabaseService.getClient();
          const entityType = this.resolveEntityType(request.path);
          const entityId =
            responseData?.id || request.params?.id || request.params?.duerpId;

          if (!entityType || !entityId) return;

          await client.from('audit_logs').insert({
            user_id: request.user?.id,
            company_id: request.user?.company_id,
            entity_type: entityType,
            entity_id: entityId,
            action: this.resolveAction(method),
            details: {
              path: request.path,
              body: this.sanitizeBody(request.body),
            },
            ip_address: request.ip,
          });
        } catch (error) {
          console.error('Audit log error:', error);
        }
      }),
    );
  }

  private resolveEntityType(path: string): string | null {
    if (path.includes('/companies')) return 'company';
    if (path.includes('/sites')) return 'site';
    if (path.includes('/duerps')) return 'duerp';
    if (path.includes('/action-plans')) return 'action_plan';
    if (path.includes('/risks')) return 'risk';
    if (path.includes('/work-units')) return 'work_unit';
    if (path.includes('/profiles')) return 'profile';
    if (path.includes('/compliance')) return 'compliance';
    return null;
  }

  private resolveAction(method: string): string {
    switch (method) {
      case 'POST':
        return 'create';
      case 'PATCH':
      case 'PUT':
        return 'update';
      case 'DELETE':
        return 'delete';
      default:
        return 'unknown';
    }
  }

  private sanitizeBody(body: any): any {
    if (!body) return null;
    const sanitized = { ...body };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    return sanitized;
  }
}
