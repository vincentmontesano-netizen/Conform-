import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';
import { CreateDuerpTriggerDto } from './dto/create-duerp-trigger.dto';

@Injectable()
export class DuerpTriggerService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(companyId: string, resolved?: boolean) {
    if (!companyId) return [];

    const client = this.supabaseService.getClient();
    let query = client
      .from('duerp_triggers')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (resolved !== undefined) {
      query = query.eq('is_resolved', resolved);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('duerp_triggers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Declencheur non trouve');
    return data;
  }

  async create(dto: CreateDuerpTriggerDto, user: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('duerp_triggers')
      .insert({
        ...dto,
        company_id: user.company_id,
        created_by: user.id,
        occurred_at: dto.occurred_at || new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async resolve(id: string, userId: string, duerpVersionId?: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('duerp_triggers')
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by_duerp_version_id: duerpVersionId || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async countUnresolved(companyId: string): Promise<number> {
    if (!companyId) return 0;

    const client = this.supabaseService.getClient();
    const { count, error } = await client
      .from('duerp_triggers')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_resolved', false);

    if (error) throw error;
    return count || 0;
  }
}
