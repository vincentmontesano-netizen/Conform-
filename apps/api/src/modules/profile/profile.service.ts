import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class ProfileService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findByUserId(userId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) throw new NotFoundException('Profil non trouve');
    return data;
  }

  async update(userId: string, dto: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('profiles')
      .update(dto)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
