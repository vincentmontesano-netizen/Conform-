import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(companyId: string) {
    if (!companyId) return [];

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

    // Assigne la nouvelle entreprise à l'utilisateur s'il n'en a pas encore
    const { data: profile } = await client
      .from('profiles')
      .select('company_id')
      .eq('user_id', userId)
      .single();

    if (!profile?.company_id && data?.id) {
      await client
        .from('profiles')
        .update({ company_id: data.id })
        .eq('user_id', userId);
    }

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
