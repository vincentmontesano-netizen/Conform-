import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token manquant');
    }

    const token = authHeader.substring(7);
    const client = this.supabaseService.getClient();

    const {
      data: { user },
      error,
    } = await client.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Token invalide');
    }

    // Fetch profile for role info
    const { data: profile } = await client
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    request.user = {
      id: user.id,
      email: user.email,
      ...profile,
    };

    request.accessToken = token;

    return true;
  }
}
