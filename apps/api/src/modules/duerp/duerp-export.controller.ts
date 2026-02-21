import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DuerpService } from './duerp.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SupabaseService } from '../../config/supabase.service';

@Controller('duerps')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class DuerpExportController {
  constructor(
    private readonly duerpService: DuerpService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get(':id/export/inspection')
  async exportInspection(@Param('id') id: string) {
    const client = this.supabaseService.getClient();

    // Get DUERP with all related data
    const duerp = await this.duerpService.findOne(id);

    // Get versions
    const versions = await this.duerpService.getVersions(id);

    // Get triggers for this company
    const { data: triggers } = await client
      .from('duerp_triggers')
      .select('*')
      .eq('company_id', (duerp as any).company_id)
      .order('created_at', { ascending: false });

    // Get audit logs
    const { data: auditLogs } = await client
      .from('audit_logs')
      .select('*')
      .eq('entity_type', 'duerp_documents')
      .eq('entity_id', id)
      .order('created_at', { ascending: false })
      .limit(100);

    // Get action plan logs
    const actionPlans = (duerp as any).action_plans || [];
    const actionPlanLogs: Record<string, any[]> = {};
    for (const plan of actionPlans) {
      const logs = await this.duerpService.getActionPlanLogs(id, plan.id);
      actionPlanLogs[plan.id] = logs;
    }

    return {
      duerp,
      versions,
      triggers: triggers || [],
      auditLogs: auditLogs || [],
      actionPlanLogs,
      exportedAt: new Date().toISOString(),
      exportType: 'inspection_complete',
    };
  }
}
