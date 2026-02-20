import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class AuditLogService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(
    companyId: string,
    entityType?: string,
    page?: number,
    pageSize?: number,
  ) {
    const client = this.supabaseService.getClient();
    const size = pageSize && pageSize > 0 ? Math.min(pageSize, 100) : 20;
    const currentPage = page && page > 0 ? page : 1;
    const from = (currentPage - 1) * size;
    const to = from + size - 1;

    let query = client
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page: currentPage,
      pageSize: size,
    };
  }
}
