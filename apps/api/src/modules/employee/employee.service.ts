import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // ─── CRUD ─────────────────────────────────────────

  async findAll(
    companyId: string,
    filters: {
      search?: string;
      site_id?: string;
      is_active?: boolean;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const client = this.supabaseService.getClient();
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;

    let query = client
      .from('employees')
      .select('*, sites(id, name)', { count: 'exact' })
      .eq('company_id', companyId)
      .order('nom', { ascending: true })
      .order('prenom', { ascending: true })
      .range(offset, offset + limit - 1);

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    if (filters.site_id) {
      query = query.eq('site_id', filters.site_id);
    }
    if (filters.search) {
      query = query.or(
        `nom.ilike.%${filters.search}%,prenom.ilike.%${filters.search}%,poste.ilike.%${filters.search}%,email.ilike.%${filters.search}%`,
      );
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return { employees: data || [], total: count || 0, page, limit };
  }

  async findOne(id: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('employees')
      .select('*, sites(id, name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('Salarie non trouve');
    return data;
  }

  async findOneWithRelations(id: string) {
    const client = this.supabaseService.getClient();

    // Get employee
    const employee = await this.findOne(id);

    // Get EPI attributions for this employee
    const { data: epiAttributions } = await client
      .from('epi_attributions')
      .select('*, epi_items(id, reference, epi_categories(id, name, code))')
      .eq('employee_id', id)
      .order('date_attribution', { ascending: false });

    // Get registre entries linked to this employee
    const { data: registreEntries } = await client
      .from('registre_entries')
      .select('*, registres(id, type, name)')
      .eq('employee_id', id)
      .order('created_at', { ascending: false });

    return {
      ...employee,
      epi_attributions: epiAttributions || [],
      registre_entries: registreEntries || [],
    };
  }

  async create(dto: CreateEmployeeDto, user: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('employees')
      .insert({
        company_id: user.company_id,
        site_id: dto.site_id || null,
        nom: dto.nom,
        prenom: dto.prenom,
        email: dto.email || null,
        telephone: dto.telephone || null,
        poste: dto.poste || null,
        departement: dto.departement || null,
        date_entree: dto.date_entree,
        date_sortie: dto.date_sortie || null,
        type_contrat: dto.type_contrat || 'cdi',
      })
      .select('*, sites(id, name)')
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    const client = this.supabaseService.getClient();
    const updateData: Record<string, unknown> = {};

    if (dto.nom !== undefined) updateData.nom = dto.nom;
    if (dto.prenom !== undefined) updateData.prenom = dto.prenom;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.telephone !== undefined) updateData.telephone = dto.telephone;
    if (dto.poste !== undefined) updateData.poste = dto.poste;
    if (dto.departement !== undefined) updateData.departement = dto.departement;
    if (dto.date_entree !== undefined) updateData.date_entree = dto.date_entree;
    if (dto.date_sortie !== undefined) updateData.date_sortie = dto.date_sortie;
    if (dto.type_contrat !== undefined) updateData.type_contrat = dto.type_contrat;
    if (dto.site_id !== undefined) updateData.site_id = dto.site_id;
    if (dto.is_active !== undefined) updateData.is_active = dto.is_active;

    const { data, error } = await client
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .select('*, sites(id, name)')
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('Salarie non trouve');
    return data;
  }

  async softDelete(id: string) {
    return this.update(id, { is_active: false, date_sortie: new Date().toISOString().split('T')[0] });
  }

  // ─── Search (autocomplete) ────────────────────────

  async search(companyId: string, query: string, limit: number = 10) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('employees')
      .select('id, nom, prenom, poste, site_id')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .or(`nom.ilike.%${query}%,prenom.ilike.%${query}%`)
      .order('nom', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // ─── Import from RUP ─────────────────────────────

  async importFromRup(companyId: string, user: any) {
    const client = this.supabaseService.getClient();

    // Find the RUP registre for this company
    const { data: rupRegistre } = await client
      .from('registres')
      .select('id')
      .eq('company_id', companyId)
      .eq('type', 'rup')
      .eq('is_active', true)
      .single();

    if (!rupRegistre) {
      return { imported: 0, message: 'Aucun registre RUP trouve' };
    }

    // Get all RUP entries
    const { data: entries } = await client
      .from('registre_entries')
      .select('data')
      .eq('registre_id', rupRegistre.id)
      .eq('is_archived', false);

    if (!entries || entries.length === 0) {
      return { imported: 0, message: 'Aucune entree RUP' };
    }

    // Get existing employees to avoid duplicates
    const { data: existing } = await client
      .from('employees')
      .select('nom, prenom')
      .eq('company_id', companyId);

    const existingSet = new Set(
      (existing || []).map((e: any) => `${e.nom}|${e.prenom}`),
    );

    const toInsert: any[] = [];
    for (const entry of entries) {
      const d = entry.data as Record<string, any>;
      const nom = d?.nom || d?.salarie_nom;
      const prenom = d?.prenom || '';
      if (!nom) continue;

      const key = `${nom}|${prenom}`;
      if (existingSet.has(key)) continue;
      existingSet.add(key);

      toInsert.push({
        company_id: companyId,
        nom,
        prenom,
        email: d?.email || null,
        telephone: d?.telephone || null,
        poste: d?.emploi || d?.poste || null,
        departement: d?.departement || null,
        date_entree: d?.date_entree || new Date().toISOString().split('T')[0],
        date_sortie: d?.date_sortie || null,
        type_contrat: this.mapContratType(d?.type_contrat),
        is_active: !d?.date_sortie,
      });
    }

    if (toInsert.length === 0) {
      return { imported: 0, message: 'Tous les salaries existent deja' };
    }

    const { data, error } = await client
      .from('employees')
      .insert(toInsert)
      .select();

    if (error) throw error;
    return { imported: (data || []).length, employees: data };
  }

  // ─── Stats ────────────────────────────────────────

  async getStats(companyId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('employees')
      .select('is_active, type_contrat')
      .eq('company_id', companyId);

    if (error) throw error;
    const employees = data || [];

    const active = employees.filter((e: any) => e.is_active).length;
    const inactive = employees.filter((e: any) => !e.is_active).length;
    const byContrat: Record<string, number> = {};
    for (const e of employees) {
      if (e.is_active) {
        byContrat[e.type_contrat] = (byContrat[e.type_contrat] || 0) + 1;
      }
    }

    return { total: employees.length, active, inactive, by_contrat: byContrat };
  }

  private mapContratType(raw: string | undefined): string {
    if (!raw) return 'cdi';
    const lower = raw.toLowerCase();
    if (lower.includes('cdi')) return 'cdi';
    if (lower.includes('cdd')) return 'cdd';
    if (lower.includes('interim') || lower.includes('intérim')) return 'interim';
    if (lower.includes('apprenti')) return 'apprenti';
    if (lower.includes('stage')) return 'stage';
    return 'autre';
  }
}
