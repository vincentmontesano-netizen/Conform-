import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class AuditLogService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(companyId: string, entityType?: string, limit?: number) {
    const client = this.supabaseService.getClient();
    let query = client
      .from('audit_logs')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}
