import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';
import { FormationService } from '../formation/formation.service';
import { RegistreType } from '@conform-plus/shared';
import type {
  InspectionCheck,
  InspectionModuleResult,
  InspectionDeadline,
  InspectionReadiness,
} from '@conform-plus/shared';

@Injectable()
export class InspectionService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly formationService: FormationService,
  ) {}

  async getReadiness(companyId: string): Promise<InspectionReadiness> {
    const [duerpResult, registresResult, epiResult, formationsResult, deadlines, alertsCount] =
      await Promise.all([
        this.checkDuerp(companyId),
        this.checkRegistres(companyId),
        this.checkEpi(companyId),
        this.checkFormations(companyId),
        this.getCriticalDeadlines(companyId),
        this.getAlertsCount(companyId),
      ]);

    // Weighted global score: DUERP 30%, EPI 20%, Formations 25%, Registres 25%
    const globalScore = Math.round(
      duerpResult.score * 0.3 +
        epiResult.score * 0.2 +
        formationsResult.score * 0.25 +
        registresResult.score * 0.25,
    );

    return {
      global_score: globalScore,
      modules: {
        duerp: duerpResult,
        registres: registresResult,
        epi: epiResult,
        formations: formationsResult,
      },
      critical_deadlines: deadlines,
      alerts_count: alertsCount,
    };
  }

  // ─── DUERP Checks (6) ─────────────────────────────

  private async checkDuerp(companyId: string): Promise<InspectionModuleResult> {
    const client = this.supabaseService.getClient();
    const checks: InspectionCheck[] = [];

    // Fetch latest DUERP
    const { data: duerps } = await client
      .from('duerps')
      .select('id, status, validated_at, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(1);

    const duerp = duerps?.[0] || null;

    // Check 1: DUERP exists and is valid
    checks.push({
      id: 'duerp_exists',
      label: 'DUERP existe et est valide',
      passed: !!duerp && duerp.status === 'validated',
      details: duerp
        ? duerp.status === 'validated'
          ? 'DUERP valide en place'
          : `DUERP en statut "${duerp.status}"`
        : 'Aucun DUERP trouve',
      severity: !duerp ? 'critical' : duerp.status !== 'validated' ? 'warning' : 'info',
    });

    // Check 2: Updated within last 12 months
    const isRecent =
      duerp?.validated_at &&
      new Date(duerp.validated_at).getTime() > Date.now() - 365 * 24 * 60 * 60 * 1000;
    checks.push({
      id: 'duerp_recent',
      label: 'Mise a jour < 12 mois',
      passed: !!isRecent,
      details: duerp?.validated_at
        ? `Derniere validation : ${new Date(duerp.validated_at).toLocaleDateString('fr-FR')}`
        : 'Aucune date de validation',
      severity: !isRecent ? 'critical' : 'info',
    });

    if (duerp) {
      // Check 3: Unresolved triggers
      const { count: unresolvedTriggers } = await client
        .from('duerp_triggers')
        .select('id', { count: 'exact', head: true })
        .eq('duerp_id', duerp.id)
        .eq('is_resolved', false);

      checks.push({
        id: 'duerp_triggers',
        label: 'Declencheurs resolus',
        passed: (unresolvedTriggers || 0) === 0,
        details:
          (unresolvedTriggers || 0) > 0
            ? `${unresolvedTriggers} declencheur(s) non resolu(s)`
            : 'Tous les declencheurs sont resolus',
        severity: (unresolvedTriggers || 0) > 0 ? 'warning' : 'info',
      });

      // Check 4: Risks identified
      const { count: risksCount } = await client
        .from('risks')
        .select('id', { count: 'exact', head: true })
        .eq('duerp_id', duerp.id);

      checks.push({
        id: 'duerp_risks',
        label: 'Risques identifies',
        passed: (risksCount || 0) > 0,
        details:
          (risksCount || 0) > 0
            ? `${risksCount} risque(s) identifie(s)`
            : 'Aucun risque identifie dans le DUERP',
        severity: (risksCount || 0) === 0 ? 'critical' : 'info',
      });

      // Check 5: PAPRIPACT defined (actions exist)
      const { count: actionsCount } = await client
        .from('actions')
        .select('id', { count: 'exact', head: true })
        .eq('duerp_id', duerp.id);

      checks.push({
        id: 'duerp_papripact',
        label: 'PAPRIPACT defini',
        passed: (actionsCount || 0) > 0,
        details:
          (actionsCount || 0) > 0
            ? `${actionsCount} action(s) dans le PAPRIPACT`
            : 'Aucune action definie',
        severity: (actionsCount || 0) === 0 ? 'warning' : 'info',
      });

      // Check 6: Critical actions have proofs
      const { data: criticalActions } = await client
        .from('actions')
        .select('id, has_proof')
        .eq('duerp_id', duerp.id)
        .eq('is_critical', true);

      const criticalWithoutProof = (criticalActions || []).filter((a: any) => !a.has_proof);
      checks.push({
        id: 'duerp_proofs',
        label: 'Preuves sur actions critiques',
        passed: criticalWithoutProof.length === 0,
        details:
          criticalWithoutProof.length > 0
            ? `${criticalWithoutProof.length} action(s) critique(s) sans preuve`
            : 'Toutes les actions critiques ont une preuve',
        severity: criticalWithoutProof.length > 0 ? 'warning' : 'info',
      });
    } else {
      // Fill remaining checks as failed if no DUERP
      for (const check of [
        { id: 'duerp_triggers', label: 'Declencheurs resolus' },
        { id: 'duerp_risks', label: 'Risques identifies' },
        { id: 'duerp_papripact', label: 'PAPRIPACT defini' },
        { id: 'duerp_proofs', label: 'Preuves sur actions critiques' },
      ]) {
        checks.push({
          id: check.id,
          label: check.label,
          passed: false,
          details: 'Aucun DUERP disponible',
          severity: 'critical',
        });
      }
    }

    const passed = checks.filter((c) => c.passed).length;
    const score = checks.length > 0 ? Math.round((passed / checks.length) * 100) : 0;

    return { module: 'duerp', score, checks };
  }

  // ─── Registres Checks (4) ─────────────────────────

  private async checkRegistres(companyId: string): Promise<InspectionModuleResult> {
    const client = this.supabaseService.getClient();
    const checks: InspectionCheck[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Fetch existing registres
    const { data: registres } = await client
      .from('registres')
      .select('type, id')
      .eq('company_id', companyId)
      .eq('is_active', true);

    const existingTypes = new Set((registres || []).map((r: any) => r.type));
    const requiredTypes = Object.values(RegistreType);
    const missingTypes = requiredTypes.filter((t) => !existingTypes.has(t));

    // Check 1: RUP a jour
    const hasRup = existingTypes.has(RegistreType.RUP);
    checks.push({
      id: 'registres_rup',
      label: 'Registre Unique du Personnel (RUP)',
      passed: hasRup,
      details: hasRup ? 'RUP present et actif' : 'RUP manquant',
      severity: !hasRup ? 'critical' : 'info',
    });

    // Check 2: All required registres present
    checks.push({
      id: 'registres_obligatoires',
      label: 'Registres obligatoires presents',
      passed: missingTypes.length === 0,
      details:
        missingTypes.length > 0
          ? `${missingTypes.length} registre(s) manquant(s) : ${missingTypes.join(', ')}`
          : `${requiredTypes.length} registres obligatoires presents`,
      severity: missingTypes.length > 0 ? 'warning' : 'info',
    });

    // Check 3: No expired entries
    const { count: expiredCount } = await client
      .from('registre_entries')
      .select('id, registres!inner(company_id)', { count: 'exact', head: true })
      .eq('registres.company_id', companyId)
      .eq('is_archived', false)
      .not('expires_at', 'is', null)
      .lt('expires_at', today);

    checks.push({
      id: 'registres_expired',
      label: 'Aucune entree expiree',
      passed: (expiredCount || 0) === 0,
      details:
        (expiredCount || 0) > 0
          ? `${expiredCount} entree(s) expiree(s)`
          : 'Aucune entree expiree',
      severity: (expiredCount || 0) > 0 ? 'warning' : 'info',
    });

    // Check 4: Registres have recent entries (last 12 months)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oneYearAgoStr = oneYearAgo.toISOString();

    let registresWithRecentEntries = 0;
    for (const reg of registres || []) {
      const { count } = await client
        .from('registre_entries')
        .select('id', { count: 'exact', head: true })
        .eq('registre_id', reg.id)
        .eq('is_archived', false)
        .gte('created_at', oneYearAgoStr);

      if ((count || 0) > 0) registresWithRecentEntries++;
    }

    const totalRegistres = (registres || []).length;
    checks.push({
      id: 'registres_recent',
      label: 'Registres avec entrees recentes',
      passed: totalRegistres > 0 && registresWithRecentEntries === totalRegistres,
      details:
        totalRegistres === 0
          ? 'Aucun registre'
          : `${registresWithRecentEntries}/${totalRegistres} registres avec entrees < 12 mois`,
      severity:
        totalRegistres > 0 && registresWithRecentEntries < totalRegistres ? 'warning' : 'info',
    });

    const passed = checks.filter((c) => c.passed).length;
    const score = checks.length > 0 ? Math.round((passed / checks.length) * 100) : 0;

    return { module: 'registres', score, checks };
  }

  // ─── EPI Checks (4) ──────────────────────────────

  private async checkEpi(companyId: string): Promise<InspectionModuleResult> {
    const client = this.supabaseService.getClient();
    const checks: InspectionCheck[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Check 1: No expired EPI in service
    const { count: expiredEpi } = await client
      .from('epi_items')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .not('statut', 'in', '("retire","perdu")')
      .not('date_expiration', 'is', null)
      .lte('date_expiration', today);

    checks.push({
      id: 'epi_expired',
      label: 'Aucun EPI expire en service',
      passed: (expiredEpi || 0) === 0,
      details:
        (expiredEpi || 0) > 0
          ? `${expiredEpi} EPI expire(s) encore en service`
          : 'Aucun EPI expire',
      severity: (expiredEpi || 0) > 0 ? 'critical' : 'info',
    });

    // Check 2: Controles periodiques a jour
    const { count: overdueControle } = await client
      .from('epi_items')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .not('statut', 'in', '("retire","perdu")')
      .not('date_prochain_controle', 'is', null)
      .lte('date_prochain_controle', today);

    checks.push({
      id: 'epi_controles',
      label: 'Controles periodiques a jour',
      passed: (overdueControle || 0) === 0,
      details:
        (overdueControle || 0) > 0
          ? `${overdueControle} EPI avec controle en retard`
          : 'Tous les controles a jour',
      severity: (overdueControle || 0) > 0 ? 'warning' : 'info',
    });

    // Check 3: All employees equipped
    const { count: totalEmployees } = await client
      .from('employees')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_active', true);

    const { data: employeesWithEpi } = await client
      .from('epi_attributions')
      .select('employee_id')
      .not('employee_id', 'is', null);

    const uniqueEquipped = new Set(
      (employeesWithEpi || []).map((a: any) => a.employee_id).filter(Boolean),
    );
    const unequipped = Math.max(0, (totalEmployees || 0) - uniqueEquipped.size);

    checks.push({
      id: 'epi_equipped',
      label: 'Tous les salaries equipes',
      passed: unequipped === 0,
      details:
        unequipped > 0
          ? `${unequipped} salarie(s) sans EPI attribue`
          : 'Tous les salaries sont equipes',
      severity: unequipped > 0 ? 'warning' : 'info',
    });

    // Check 4: Attribution attestations available (documents on attributions)
    const { count: totalAttributions } = await client
      .from('epi_attributions')
      .select('id, epi_items!inner(company_id)', { count: 'exact', head: true })
      .eq('epi_items.company_id', companyId);

    const { count: attestationsWithDocs } = await client
      .from('epi_documents')
      .select('id, epi_attribution_id', { count: 'exact', head: true })
      .not('epi_attribution_id', 'is', null);

    const hasAttestations =
      (totalAttributions || 0) === 0 || (attestationsWithDocs || 0) > 0;

    checks.push({
      id: 'epi_attestations',
      label: 'Attestations disponibles',
      passed: hasAttestations,
      details: hasAttestations
        ? 'Attestations de remise disponibles'
        : 'Aucune attestation de remise uploadee',
      severity: !hasAttestations ? 'warning' : 'info',
    });

    const passed = checks.filter((c) => c.passed).length;
    const score = checks.length > 0 ? Math.round((passed / checks.length) * 100) : 0;

    return { module: 'epi', score, checks };
  }

  // ─── Formations Checks (4) ────────────────────────

  private async checkFormations(companyId: string): Promise<InspectionModuleResult> {
    const checks: InspectionCheck[] = [];
    const stats = await this.formationService.getFormationStats(companyId);

    // Check 1: No expired habilitations
    checks.push({
      id: 'formations_habilitations',
      label: 'Aucune habilitation expiree',
      passed: stats.habilitations_expired === 0,
      details:
        stats.habilitations_expired > 0
          ? `${stats.habilitations_expired} habilitation(s) expiree(s)`
          : 'Toutes les habilitations sont a jour',
      severity: stats.habilitations_expired > 0 ? 'critical' : 'info',
    });

    // Check 2: Mandatory formations covered
    checks.push({
      id: 'formations_obligatoires',
      label: 'Formations obligatoires couvertes',
      passed: stats.obligatoires_manquantes === 0,
      details:
        stats.obligatoires_manquantes > 0
          ? `${stats.obligatoires_manquantes} formation(s) obligatoire(s) manquante(s)`
          : 'Toutes les formations obligatoires sont couvertes',
      severity: stats.obligatoires_manquantes > 0 ? 'critical' : 'info',
    });

    // Check 3: Conformity score > 80%
    checks.push({
      id: 'formations_score',
      label: 'Score conformite > 80%',
      passed: stats.global_score >= 80,
      details: `Score global formations : ${stats.global_score}%`,
      severity: stats.global_score < 80 ? 'warning' : 'info',
    });

    // Check 4: Attestations uploaded (check registre_entry_documents exist for formation entries)
    const client = this.supabaseService.getClient();
    const { count: formationEntries } = await client
      .from('registre_entries')
      .select('id, registres!inner(company_id, type)', { count: 'exact', head: true })
      .eq('registres.company_id', companyId)
      .eq('is_archived', false)
      .in('registres.type', ['formations', 'habilitations']);

    const { count: entriesWithDocs } = await client
      .from('registre_entry_documents')
      .select('id, registre_entries!inner(registre_id, registres!inner(company_id, type))', {
        count: 'exact',
        head: true,
      })
      .eq('registre_entries.registres.company_id', companyId)
      .in('registre_entries.registres.type', ['formations', 'habilitations']);

    const hasAttestations =
      (formationEntries || 0) === 0 || (entriesWithDocs || 0) > 0;

    checks.push({
      id: 'formations_attestations',
      label: 'Attestations uploadees',
      passed: hasAttestations,
      details: hasAttestations
        ? 'Attestations de formation disponibles'
        : 'Aucune attestation de formation uploadee',
      severity: !hasAttestations ? 'warning' : 'info',
    });

    const passed = checks.filter((c) => c.passed).length;
    const score = checks.length > 0 ? Math.round((passed / checks.length) * 100) : 0;

    return { module: 'formations', score, checks };
  }

  // ─── Critical Deadlines (30 days) ─────────────────

  private async getCriticalDeadlines(companyId: string): Promise<InspectionDeadline[]> {
    const client = this.supabaseService.getClient();
    const deadlines: InspectionDeadline[] = [];
    const today = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    const todayStr = today.toISOString().split('T')[0];
    const thirtyDaysStr = thirtyDays.toISOString().split('T')[0];

    // EPI expiring
    const { data: expiringEpi } = await client
      .from('epi_items')
      .select('id, reference, date_expiration, epi_categories(name)')
      .eq('company_id', companyId)
      .not('statut', 'in', '("retire","perdu")')
      .not('date_expiration', 'is', null)
      .gte('date_expiration', todayStr)
      .lte('date_expiration', thirtyDaysStr)
      .order('date_expiration', { ascending: true })
      .limit(10);

    for (const item of expiringEpi || []) {
      deadlines.push({
        id: `epi-${item.id}`,
        module: 'epi',
        label: `EPI ${(item as any).epi_categories?.name || ''} (${item.reference || 'sans ref'}) expire`,
        date: item.date_expiration,
        severity: 'warning',
      });
    }

    // EPI controles overdue
    const { data: overdueControles } = await client
      .from('epi_items')
      .select('id, reference, date_prochain_controle, epi_categories(name)')
      .eq('company_id', companyId)
      .not('statut', 'in', '("retire","perdu")')
      .not('date_prochain_controle', 'is', null)
      .lte('date_prochain_controle', thirtyDaysStr)
      .order('date_prochain_controle', { ascending: true })
      .limit(10);

    for (const item of overdueControles || []) {
      const isOverdue = item.date_prochain_controle < todayStr;
      deadlines.push({
        id: `epi-controle-${item.id}`,
        module: 'epi',
        label: `Controle ${(item as any).epi_categories?.name || ''} (${item.reference || 'sans ref'})`,
        date: item.date_prochain_controle,
        severity: isOverdue ? 'critical' : 'warning',
      });
    }

    // Registre entries expiring
    const { data: expiringEntries } = await client
      .from('registre_entries')
      .select('id, expires_at, data, registres!inner(company_id, type, name)')
      .eq('registres.company_id', companyId)
      .eq('is_archived', false)
      .not('expires_at', 'is', null)
      .gte('expires_at', todayStr)
      .lte('expires_at', thirtyDaysStr)
      .order('expires_at', { ascending: true })
      .limit(10);

    for (const entry of expiringEntries || []) {
      const data = entry.data as Record<string, any>;
      const name = data?.salarie_nom || data?.intitule || (entry as any).registres?.name;
      deadlines.push({
        id: `registre-${entry.id}`,
        module: 'registres',
        label: `${(entry as any).registres?.type} : ${name}`,
        date: entry.expires_at!,
        severity: 'warning',
      });
    }

    // DUERP annual update check
    const { data: duerps } = await client
      .from('duerps')
      .select('id, validated_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (duerps?.[0]?.validated_at) {
      const validatedAt = new Date(duerps[0].validated_at);
      const anniversaryDate = new Date(validatedAt);
      anniversaryDate.setFullYear(anniversaryDate.getFullYear() + 1);
      const daysUntilAnniversary = Math.floor(
        (anniversaryDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
      );

      if (daysUntilAnniversary <= 30) {
        deadlines.push({
          id: 'duerp-annual',
          module: 'duerp',
          label: 'Mise a jour annuelle du DUERP',
          date: anniversaryDate.toISOString().split('T')[0],
          severity: daysUntilAnniversary <= 0 ? 'critical' : 'warning',
        });
      }
    }

    // Sort by date
    deadlines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return deadlines;
  }

  private async getAlertsCount(companyId: string): Promise<number> {
    const client = this.supabaseService.getClient();
    const { count } = await client
      .from('compliance_alerts')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_resolved', false);

    return count || 0;
  }
}
