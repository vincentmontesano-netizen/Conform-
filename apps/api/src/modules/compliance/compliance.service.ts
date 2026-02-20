import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class ComplianceService {
  private readonly rulesEngineUrl: string;

  constructor(private readonly supabaseService: SupabaseService) {
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

  async getAlerts(companyId: string) {
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
