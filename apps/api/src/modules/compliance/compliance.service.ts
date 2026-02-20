import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class ComplianceService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getScore(companyId: string) {
    const client = this.supabaseService.getClient();
    const { data: checks, error } = await client
      .from('compliance_checks')
      .select('*')
      .eq('company_id', companyId);

    if (error) throw error;

    const total = checks?.length || 0;
    const completed = checks?.filter((c: any) => c.status === 'compliant').length || 0;
    const score = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { score, total, completed };
  }

  async getChecks(companyId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('compliance_checks')
      .select('*')
      .eq('company_id', companyId)
      .order('category');

    if (error) throw error;
    return data;
  }

  async updateCheck(id: string, dto: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('compliance_checks')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
