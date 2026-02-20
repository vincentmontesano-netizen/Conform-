import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class DuerpService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(companyId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('duerps')
      .select('*, sites(name)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('duerps')
      .select('*, work_units(*, risks(*)), action_plans(*)')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('DUERP non trouve');
    return data;
  }

  async create(dto: any, user: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('duerps')
      .insert({
        ...dto,
        company_id: user.company_id,
        created_by: user.id,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, dto: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('duerps')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async validate(id: string, user: any) {
    const client = this.supabaseService.getClient();

    // Get current DUERP
    const { data: duerp, error: fetchError } = await client
      .from('duerps')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !duerp) throw new NotFoundException('DUERP non trouve');

    // Get current max version
    const { data: versions } = await client
      .from('duerp_versions')
      .select('version_number')
      .eq('duerp_id', id)
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersion = versions && versions.length > 0
      ? versions[0].version_number + 1
      : 1;

    // Create version snapshot
    const { data: version, error: versionError } = await client
      .from('duerp_versions')
      .insert({
        duerp_id: id,
        version_number: nextVersion,
        snapshot: duerp,
        validated_by: user.id,
      })
      .select()
      .single();

    if (versionError) throw versionError;

    // Update DUERP status
    await client
      .from('duerps')
      .update({ status: 'validated', current_version: nextVersion })
      .eq('id', id);

    return version;
  }

  async getVersions(id: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('duerp_versions')
      .select('*')
      .eq('duerp_id', id)
      .order('version_number', { ascending: false });

    if (error) throw error;
    return data;
  }

  async addWorkUnit(duerpId: string, dto: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('work_units')
      .insert({ ...dto, duerp_id: duerpId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addRisk(duerpId: string, unitId: string, dto: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('risks')
      .insert({
        ...dto,
        work_unit_id: unitId,
        duerp_id: duerpId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addActionPlan(duerpId: string, dto: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('action_plans')
      .insert({ ...dto, duerp_id: duerpId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateActionPlan(duerpId: string, planId: string, dto: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('action_plans')
      .update(dto)
      .eq('id', planId)
      .eq('duerp_id', duerpId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
