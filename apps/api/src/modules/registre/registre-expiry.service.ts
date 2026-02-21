import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';
import { REGISTRE_TYPE_LABELS, RegistreType } from '@conform-plus/shared';

@Injectable()
export class RegistreExpiryService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Check for expiring entries and create/update compliance alerts.
   * Called by the /registres/expiring endpoint or a scheduled job.
   */
  async checkAndCreateAlerts(companyId: string, days: number = 30): Promise<number> {
    const client = this.supabaseService.getClient();
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    // Get all non-archived entries with expiry dates within range
    const { data: entries, error } = await client
      .from('registre_entries')
      .select('id, data, expires_at, registres!inner(id, company_id, type, name)')
      .eq('registres.company_id', companyId)
      .eq('is_archived', false)
      .not('expires_at', 'is', null)
      .lte('expires_at', futureDate.toISOString().split('T')[0])
      .order('expires_at', { ascending: true });

    if (error) throw error;
    if (!entries || entries.length === 0) return 0;

    let alertsCreated = 0;

    for (const entry of entries) {
      const registre = (entry as any).registres;
      const registreType = registre.type as RegistreType;
      const expiryDate = new Date(entry.expires_at!);
      const isExpired = expiryDate < today;

      const severity = isExpired ? 'critical' : 'warning';
      const ruleType = `registre_expiry_${registreType}`;

      // Build meaningful message from entry data
      const entryData = entry.data as Record<string, unknown>;
      const entityName =
        (entryData.salarie_nom as string) ||
        (entryData.equipement as string) ||
        (entryData.nom_traitement as string) ||
        (entryData.victime_nom as string) ||
        'Entree';

      const registreLabel = REGISTRE_TYPE_LABELS[registreType] || registre.name;
      const dateStr = new Date(entry.expires_at!).toLocaleDateString('fr-FR');

      const message = isExpired
        ? `${registreLabel} : ${entityName} a expire le ${dateStr}`
        : `${registreLabel} : ${entityName} expire le ${dateStr}`;

      // Upsert alert (avoid duplicates for same entry)
      const { error: alertError } = await client
        .from('compliance_alerts')
        .upsert(
          {
            company_id: companyId,
            duerp_id: null,
            rule_type: ruleType,
            message,
            severity,
            is_resolved: false,
            created_at: new Date().toISOString(),
          },
          { onConflict: 'company_id,rule_type,message' }
        );

      if (!alertError) alertsCreated++;
    }

    return alertsCreated;
  }
}
