import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async validateToken(token: string) {
    const client = this.supabaseService.getClient();
    const { data: { user }, error } = await client.auth.getUser(token);
    if (error || !user) return null;
    return user;
  }
}
