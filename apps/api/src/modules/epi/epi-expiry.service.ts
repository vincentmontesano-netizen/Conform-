import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class EpiExpiryService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Check for expiring EPI items and create/update compliance alerts.
   * Checks both date_expiration and date_prochain_controle.
   */
  async checkAndCreateAlerts(companyId: string, days: number = 30): Promise<number> {
    const client = this.supabaseService.getClient();
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    // Get items with upcoming/past expiration
    const { data: expiringItems, error: expiryError } = await client
      .from('epi_items')
      .select('id, reference, date_expiration, epi_categories(name)')
      .eq('company_id', companyId)
      .not('statut', 'in', '("retire","perdu")')
      .not('date_expiration', 'is', null)
      .lte('date_expiration', futureDateStr);

    if (expiryError) throw expiryError;

    // Get items with overdue controls
    const { data: overdueControls, error: controleError } = await client
      .from('epi_items')
      .select('id, reference, date_prochain_controle, epi_categories(name)')
      .eq('company_id', companyId)
      .not('statut', 'in', '("retire","perdu")')
      .not('date_prochain_controle', 'is', null)
      .lte('date_prochain_controle', futureDateStr);

    if (controleError) throw controleError;

    let alertsCreated = 0;

    // Create alerts for expiring items
    for (const item of expiringItems || []) {
      const expiryDate = new Date(item.date_expiration!);
      const isExpired = expiryDate < today;
      const categoryName = (item as any).epi_categories?.name || 'EPI';
      const ref = item.reference || item.id.slice(0, 8);
      const dateStr = expiryDate.toLocaleDateString('fr-FR');

      const message = isExpired
        ? `EPI ${categoryName} (${ref}) a expire le ${dateStr}`
        : `EPI ${categoryName} (${ref}) expire le ${dateStr}`;

      const { error: alertError } = await client
        .from('compliance_alerts')
        .upsert(
          {
            company_id: companyId,
            duerp_id: null,
            rule_type: 'epi_expiry_item',
            message,
            severity: isExpired ? 'critical' : 'warning',
            is_resolved: false,
            created_at: new Date().toISOString(),
          },
          { onConflict: 'company_id,rule_type,message' },
        );

      if (!alertError) alertsCreated++;
    }

    // Create alerts for overdue controls
    for (const item of overdueControls || []) {
      const controleDate = new Date(item.date_prochain_controle!);
      const isOverdue = controleDate < today;
      const categoryName = (item as any).epi_categories?.name || 'EPI';
      const ref = item.reference || item.id.slice(0, 8);
      const dateStr = controleDate.toLocaleDateString('fr-FR');

      const message = isOverdue
        ? `Controle EPI ${categoryName} (${ref}) en retard depuis le ${dateStr}`
        : `Controle EPI ${categoryName} (${ref}) prevu le ${dateStr}`;

      const { error: alertError } = await client
        .from('compliance_alerts')
        .upsert(
          {
            company_id: companyId,
            duerp_id: null,
            rule_type: 'epi_controle_overdue',
            message,
            severity: isOverdue ? 'critical' : 'warning',
            is_resolved: false,
            created_at: new Date().toISOString(),
          },
          { onConflict: 'company_id,rule_type,message' },
        );

      if (!alertError) alertsCreated++;
    }

    return alertsCreated;
  }
}
