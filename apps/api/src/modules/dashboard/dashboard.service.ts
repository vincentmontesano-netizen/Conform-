import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class DashboardService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getOverview(companyId: string) {
    const client = this.supabaseService.getClient();

    const [sitesRes, duerpsRes, complianceRes, actionPlansRes] = await Promise.all([
      client.from('sites').select('id', { count: 'exact' }).eq('company_id', companyId),
      client.from('duerps').select('id, status', { count: 'exact' }).eq('company_id', companyId),
      client.from('compliance_checks').select('status').eq('company_id', companyId),
      client.from('action_plans').select('id, status').eq('company_id', companyId),
    ]);

    const totalChecks = complianceRes.data?.length || 0;
    const compliantChecks = complianceRes.data?.filter((c: any) => c.status === 'compliant').length || 0;
    const complianceScore = totalChecks > 0 ? Math.round((compliantChecks / totalChecks) * 100) : 0;

    const pendingActions = actionPlansRes.data?.filter((a: any) => a.status === 'pending').length || 0;
    const overdueActions = actionPlansRes.data?.filter((a: any) => a.status === 'overdue').length || 0;

    return {
      sites_count: sitesRes.count || 0,
      duerps_count: duerpsRes.count || 0,
      duerps_validated: duerpsRes.data?.filter((d: any) => d.status === 'validated').length || 0,
      compliance_score: complianceScore,
      action_plans_pending: pendingActions,
      action_plans_overdue: overdueActions,
    };
  }
}
