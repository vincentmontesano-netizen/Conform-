import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';
import { FormationService } from '../formation/formation.service';
import { RegistreType } from '@conform-plus/shared';

@Injectable()
export class ComplianceService {
  private readonly rulesEngineUrl: string;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly formationService: FormationService,
  ) {
    this.rulesEngineUrl = process.env.RULES_ENGINE_URL || 'http://localhost:8000';
  }

  async evaluate(companyId: string, duerpId: string | null, body: any) {
    const response = await fetch(`${this.rulesEngineUrl}/api/v1/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new HttpException(
        `Rules Engine error: ${response.statusText}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    const result = await response.json();

    // Persist failed rules as compliance_alerts
    const client = this.supabaseService.getClient();
    const alerts = (result.alerts || []).map((alert: any) => ({
      company_id: companyId,
      duerp_id: duerpId,
      rule_type: alert.rule_id,
      message: alert.message,
      severity: this.mapSeverity(alert.severity),
      is_resolved: false,
    }));

    if (alerts.length > 0) {
      await client.from('compliance_alerts').insert(alerts);
    }

    return result;
  }

  /**
   * Full cross-module evaluation: auto-fetches all data for the company
   * and sends the complete context to the rules engine.
   */
  async evaluateFull(companyId: string) {
    const client = this.supabaseService.getClient();

    // Fetch company info
    const { data: company } = await client
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (!company) {
      throw new HttpException('Entreprise non trouvee', HttpStatus.NOT_FOUND);
    }

    // Fetch employee count
    const { count: employeeCount } = await client
      .from('employees')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_active', true);

    // Fetch latest DUERP
    const { data: duerps } = await client
      .from('duerps')
      .select('id, validated_at, status')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(1);

    const latestDuerp = duerps?.[0] || null;

    // Fetch risks + actions from latest DUERP
    const [risksRes, actionsRes] = latestDuerp
      ? await Promise.all([
          client.from('risks').select('*, work_units(name)').eq('duerp_id', latestDuerp.id),
          client.from('actions').select('*').eq('duerp_id', latestDuerp.id),
        ])
      : [{ data: [] }, { data: [] }];

    // Build cross-module contexts in parallel
    const [epiContext, formationContext, registreContext] = await Promise.all([
      this.buildEpiContext(companyId, employeeCount || 0),
      this.buildFormationContext(companyId),
      this.buildRegistreContext(companyId),
    ]);

    const evalBody = {
      company: {
        company_id: companyId,
        employee_count: employeeCount || 0,
        has_physical_site: true,
        sector: company.secteur || 'autre',
      },
      risks: (risksRes.data || []).map((r: any) => ({
        risk_id: r.id,
        category: r.category || '',
        severity: r.severity || 'faible',
        probability: r.probability || 'peu_probable',
        is_rps: r.is_rps || false,
        work_unit_name: r.work_units?.name || '',
      })),
      actions: (actionsRes.data || []).map((a: any) => ({
        action_id: a.id,
        name: a.name || '',
        is_critical: a.is_critical || false,
        has_proof: a.has_proof || false,
        status: a.status || 'a_faire',
        deadline: a.deadline || null,
      })),
      duerp_last_validated_at: latestDuerp?.validated_at || null,
      epi: epiContext,
      formations: formationContext,
      registres: registreContext,
    };

    return this.evaluate(companyId, latestDuerp?.id || null, evalBody);
  }

  private async buildEpiContext(companyId: string, totalEmployees: number) {
    const client = this.supabaseService.getClient();
    const today = new Date().toISOString().split('T')[0];

    const [totalRes, expiredRes, overdueControleRes, employeesWithEpiRes] = await Promise.all([
      client
        .from('epi_items')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .not('statut', 'in', '("retire","perdu")'),
      client
        .from('epi_items')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .not('statut', 'in', '("retire","perdu")')
        .not('date_expiration', 'is', null)
        .lte('date_expiration', today),
      client
        .from('epi_items')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .not('statut', 'in', '("retire","perdu")')
        .not('date_prochain_controle', 'is', null)
        .lte('date_prochain_controle', today),
      client
        .from('epi_attributions')
        .select('employee_id')
        .not('employee_id', 'is', null),
    ]);

    const uniqueEmployeesWithEpi = new Set(
      (employeesWithEpiRes.data || []).map((a: any) => a.employee_id).filter(Boolean),
    );

    return {
      total_items: totalRes.count || 0,
      expired_items: expiredRes.count || 0,
      items_without_controle: overdueControleRes.count || 0,
      employees_without_epi: Math.max(0, totalEmployees - uniqueEmployeesWithEpi.size),
    };
  }

  private async buildFormationContext(companyId: string) {
    const stats = await this.formationService.getFormationStats(companyId);

    return {
      total_employees: stats.total_salaries,
      expired_formations: stats.formations_expired,
      expired_habilitations: stats.habilitations_expired,
      missing_obligatoires: stats.obligatoires_manquantes,
      global_score: stats.global_score,
    };
  }

  private async buildRegistreContext(companyId: string) {
    const client = this.supabaseService.getClient();
    const today = new Date().toISOString().split('T')[0];
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    const thirtyDaysStr = thirtyDays.toISOString().split('T')[0];

    const requiredTypes = Object.values(RegistreType);

    const [registresRes, expiredRes, expiringRes] = await Promise.all([
      client
        .from('registres')
        .select('type')
        .eq('company_id', companyId)
        .eq('is_active', true),
      client
        .from('registre_entries')
        .select('id, registres!inner(company_id)', { count: 'exact', head: true })
        .eq('registres.company_id', companyId)
        .eq('is_archived', false)
        .not('expires_at', 'is', null)
        .lt('expires_at', today),
      client
        .from('registre_entries')
        .select('id, registres!inner(company_id)', { count: 'exact', head: true })
        .eq('registres.company_id', companyId)
        .eq('is_archived', false)
        .not('expires_at', 'is', null)
        .gte('expires_at', today)
        .lte('expires_at', thirtyDaysStr),
    ]);

    const existingTypes = [...new Set((registresRes.data || []).map((r: any) => r.type))];

    return {
      required_types: requiredTypes,
      existing_types: existingTypes,
      entries_expiring: expiringRes.count || 0,
      entries_expired: expiredRes.count || 0,
    };
  }

  async getAlerts(companyId: string) {
    if (!companyId) return [];

    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('compliance_alerts')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getScore(companyId: string) {
    if (!companyId) return { score: 100, unresolved_alerts: 0 };

    const client = this.supabaseService.getClient();
    const { data: alerts, error } = await client
      .from('compliance_alerts')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_resolved', false);

    if (error) throw error;

    const unresolvedCount = alerts?.length || 0;
    let penalty = 0;
    for (const alert of alerts || []) {
      if (alert.severity === 'critical') penalty += 25;
      else if (alert.severity === 'warning') penalty += 10;
      else penalty += 5;
    }
    const score = Math.max(0, 100 - penalty);

    return { score, unresolved_alerts: unresolvedCount };
  }

  async resolveAlert(alertId: string, userId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('compliance_alerts')
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: userId,
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private mapSeverity(severity: string): string {
    if (['info', 'warning', 'critical'].includes(severity)) return severity;
    if (severity === 'critique' || severity === 'eleve') return 'critical';
    if (severity === 'modere') return 'warning';
    return 'info';
  }
}
