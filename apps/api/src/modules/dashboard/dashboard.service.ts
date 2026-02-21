import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class DashboardService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getOverview(companyId: string) {
    if (!companyId) {
      return {
        sites_count: 0,
        duerps_count: 0,
        duerps_validated: 0,
        duerps_overdue: 0,
        compliance_score: 100,
        unresolved_alerts: 0,
        unresolved_triggers: 0,
        action_plans_pending: 0,
        action_plans_overdue: 0,
        registres_count: 0,
        registre_entries_expiring: 0,
        epi_count: 0,
        epi_expiring: 0,
        epi_non_conforme: 0,
        formations_expiring: 0,
        habilitations_expiring: 0,
        formation_types_count: 0,
      };
    }

    const client = this.supabaseService.getClient();
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const thirtyDaysStr = thirtyDaysFromNow.toISOString().split('T')[0];

    const [sitesRes, duerpsRes, alertsRes, triggersRes, registresRes, expiringRes, epiItemsRes, epiExpiringRes, epiNonConformeRes, formationsExpiringRes, habilitationsExpiringRes, formationTypesRes] = await Promise.all([
      client.from('sites').select('id', { count: 'exact' }).eq('company_id', companyId),
      client.from('duerp_documents').select('id, status, next_update_due', { count: 'exact' }).eq('company_id', companyId),
      client.from('compliance_alerts').select('severity, is_resolved').eq('company_id', companyId).eq('is_resolved', false),
      client.from('duerp_triggers').select('id', { count: 'exact', head: true }).eq('company_id', companyId).eq('is_resolved', false),
      client.from('registres').select('id', { count: 'exact' }).eq('company_id', companyId).eq('is_active', true),
      client.from('registre_entries')
        .select('id, registres!inner(company_id)', { count: 'exact', head: true })
        .eq('registres.company_id', companyId)
        .eq('is_archived', false)
        .not('expires_at', 'is', null)
        .lte('expires_at', thirtyDaysStr),
      // EPI KPIs
      client.from('epi_items').select('id', { count: 'exact' }).eq('company_id', companyId).not('statut', 'in', '("retire","perdu")'),
      client.from('epi_items')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .not('statut', 'in', '("retire","perdu")')
        .not('date_expiration', 'is', null)
        .lte('date_expiration', thirtyDaysStr),
      client.from('epi_items')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('etat', 'a_remplacer'),
      // Formation KPIs — count registre_entries expiring in formations registres
      client.from('registre_entries')
        .select('id, registres!inner(company_id, type)', { count: 'exact', head: true })
        .eq('registres.company_id', companyId)
        .eq('registres.type', 'formations')
        .eq('is_archived', false)
        .not('expires_at', 'is', null)
        .lte('expires_at', thirtyDaysStr),
      // Habilitations expiring
      client.from('registre_entries')
        .select('id, registres!inner(company_id, type)', { count: 'exact', head: true })
        .eq('registres.company_id', companyId)
        .eq('registres.type', 'habilitations')
        .eq('is_archived', false)
        .not('expires_at', 'is', null)
        .lte('expires_at', thirtyDaysStr),
      // Formation types count
      client.from('formation_types')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('is_active', true),
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

    const pendingActions = actionPlans.filter((a: any) => a.status === 'a_faire' || a.status === 'en_cours').length;
    const overdueActions = actionPlans.filter((a: any) => a.deadline && a.deadline < now && a.status !== 'terminee' && a.status !== 'annulee').length;

    // Count overdue DUERPs
    const duerpsOverdue = (duerpsRes.data || []).filter(
      (d: any) => d.next_update_due && d.next_update_due < today,
    ).length;

    return {
      sites_count: sitesRes.count || 0,
      duerps_count: duerpsRes.count || 0,
      duerps_validated: duerpsRes.data?.filter((d: any) => d.status === 'validated').length || 0,
      duerps_overdue: duerpsOverdue,
      compliance_score: complianceScore,
      unresolved_alerts: unresolvedAlerts.length,
      unresolved_triggers: triggersRes.count || 0,
      action_plans_pending: pendingActions,
      action_plans_overdue: overdueActions,
      registres_count: registresRes.count || 0,
      registre_entries_expiring: expiringRes.count || 0,
      epi_count: epiItemsRes.count || 0,
      epi_expiring: epiExpiringRes.count || 0,
      epi_non_conforme: epiNonConformeRes.count || 0,
      formations_expiring: formationsExpiringRes.count || 0,
      habilitations_expiring: habilitationsExpiringRes.count || 0,
      formation_types_count: formationTypesRes.count || 0,
    };
  }
}
