import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class DashboardService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getOverview(companyId: string) {
    const client = this.supabaseService.getClient();

    const [sitesRes, duerpsRes, alertsRes] = await Promise.all([
      client.from('sites').select('id', { count: 'exact' }).eq('company_id', companyId),
      client.from('duerp_documents').select('id, status', { count: 'exact' }).eq('company_id', companyId),
      client.from('compliance_alerts').select('severity, is_resolved').eq('company_id', companyId).eq('is_resolved', false),
    ]);

    // Get action plans via duerp IDs (action_plans has no company_id)
    const duerpIds = (duerpsRes.data || []).map((d: any) => d.id);
    let actionPlans: any[] = [];
    if (duerpIds.length > 0) {
      const { data } = await client
        .from('action_plans')
        .select('id, status, deadline')
        .in('duerp_id', duerpIds);
      actionPlans = data || [];
    }

    // Score based on unresolved alerts
    const unresolvedAlerts = alertsRes.data || [];
    let penalty = 0;
    for (const alert of unresolvedAlerts) {
      if (alert.severity === 'critical') penalty += 25;
      else if (alert.severity === 'warning') penalty += 10;
      else penalty += 5;
    }
    const complianceScore = Math.max(0, 100 - penalty);

    const now = new Date().toISOString();
    const pendingActions = actionPlans.filter((a: any) => a.status === 'a_faire' || a.status === 'en_cours').length;
    const overdueActions = actionPlans.filter((a: any) => a.deadline && a.deadline < now && a.status !== 'terminee' && a.status !== 'annulee').length;

    return {
      sites_count: sitesRes.count || 0,
      duerps_count: duerpsRes.count || 0,
      duerps_validated: duerpsRes.data?.filter((d: any) => d.status === 'validated').length || 0,
      compliance_score: complianceScore,
      unresolved_alerts: unresolvedAlerts.length,
      action_plans_pending: pendingActions,
      action_plans_overdue: overdueActions,
    };
  }
}
