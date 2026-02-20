import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';

@Injectable()
export class SiteService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(companyId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('sites')
      .select('*')
      .eq('company_id', companyId);

    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('sites')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Site non trouve');
    return data;
  }

  async create(dto: CreateSiteDto, companyId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('sites')
      .insert({ ...dto, company_id: companyId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, dto: UpdateSiteDto) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('sites')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async remove(id: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client.from('sites').delete().eq('id', id);
    if (error) throw error;
    return { deleted: true };
  }
}
