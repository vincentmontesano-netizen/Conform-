import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(companyId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('companies')
      .select('*')
      .eq('id', companyId);

    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('companies')
      .select('*, sites(*)')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Entreprise non trouvee');
    return data;
  }

  async create(dto: CreateCompanyDto, userId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('companies')
      .insert(dto)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, dto: UpdateCompanyDto) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('companies')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async remove(id: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client.from('companies').delete().eq('id', id);
    if (error) throw error;
    return { deleted: true };
  }
}
