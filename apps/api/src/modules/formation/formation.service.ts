import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';
import { CreateFormationTypeDto, UpdateFormationTypeDto } from './dto/formation-type.dto';
import {
  FORMATION_TYPE_PRESETS,
  type ConformiteStatus,
  type ConformiteCell,
  type ConformiteRow,
  type ConformiteMatrix,
  type ConformiteSummary,
  type FormationStats,
  type ConformiteFilters,
  type FormationRapportData,
} from '@conform-plus/shared';

@Injectable()
export class FormationService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // ─── Formation Types CRUD ──────────────────────────

  async findAllTypes(companyId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('formation_types')
      .select('*')
      .eq('company_id', companyId)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async findActiveTypes(companyId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('formation_types')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async findOneType(id: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('formation_types')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('Type de formation non trouve');
    return data;
  }

  async createType(dto: CreateFormationTypeDto, user: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('formation_types')
      .insert({
        company_id: user.company_id,
        code: dto.code,
        name: dto.name,
        category: dto.category,
        description: dto.description || null,
        duree_validite_mois: dto.duree_validite_mois ?? null,
        norme: dto.norme || null,
        is_obligatoire: dto.is_obligatoire ?? false,
        match_registre_type: dto.match_registre_type,
        match_field_value: dto.match_field_value,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateType(id: string, dto: UpdateFormationTypeDto) {
    const client = this.supabaseService.getClient();
    const updateData: Record<string, unknown> = {};
    if (dto.code !== undefined) updateData.code = dto.code;
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.duree_validite_mois !== undefined) updateData.duree_validite_mois = dto.duree_validite_mois;
    if (dto.norme !== undefined) updateData.norme = dto.norme;
    if (dto.is_obligatoire !== undefined) updateData.is_obligatoire = dto.is_obligatoire;
    if (dto.match_registre_type !== undefined) updateData.match_registre_type = dto.match_registre_type;
    if (dto.match_field_value !== undefined) updateData.match_field_value = dto.match_field_value;
    if (dto.is_active !== undefined) updateData.is_active = dto.is_active;

    const { data, error } = await client
      .from('formation_types')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('Type de formation non trouve');
    return data;
  }

  async deleteType(id: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client.from('formation_types').delete().eq('id', id);
    if (error) throw error;
    return { deleted: true };
  }

  async initFromPresets(user: any) {
    const client = this.supabaseService.getClient();

    // Get existing types to avoid duplicates
    const { data: existing } = await client
      .from('formation_types')
      .select('code')
      .eq('company_id', user.company_id);

    const existingCodes = new Set((existing || []).map((t: any) => t.code));

    const toInsert = FORMATION_TYPE_PRESETS
      .filter((p) => !existingCodes.has(p.code))
      .map((p) => ({
        company_id: user.company_id,
        code: p.code,
        name: p.name,
        category: p.category,
        description: p.description,
        duree_validite_mois: p.duree_validite_mois,
        norme: p.norme,
        is_obligatoire: p.is_obligatoire,
        match_registre_type: p.match_registre_type,
        match_field_value: p.match_field_value,
      }));

    if (toInsert.length === 0) {
      return { created: 0, message: 'Tous les types existent deja' };
    }

    const { data, error } = await client
      .from('formation_types')
      .insert(toInsert)
      .select();

    if (error) throw error;
    return { created: (data || []).length, types: data };
  }

  // ─── Conformite Matrix (coeur du module) ───────────

  /**
   * Construit la matrice de conformite : employees x formation_types.
   *
   * 1. Fetch tous les formation_types actifs
   * 2. Fetch TOUTES les registre_entries non-archivees (formations + habilitations)
   * 3. Extraire les employees uniques depuis le JSONB salarie_nom
   * 4. Pour chaque employee x type, trouver l'entree la plus recente, classifier
   * 5. Retourner la matrice avec summary
   */
  async getConformiteMatrix(companyId: string, filters?: ConformiteFilters): Promise<ConformiteMatrix> {
    const client = this.supabaseService.getClient();

    // 1. Fetch active formation types
    let typesQuery = client
      .from('formation_types')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('category')
      .order('name');

    if (filters?.category) {
      typesQuery = typesQuery.eq('category', filters.category);
    }
    if (filters?.obligatoire_only) {
      typesQuery = typesQuery.eq('is_obligatoire', true);
    }

    const { data: formationTypes, error: typesError } = await typesQuery;
    if (typesError) throw typesError;

    if (!formationTypes || formationTypes.length === 0) {
      return {
        columns: [],
        rows: [],
        summary: {
          total_employees: 0,
          total_types: 0,
          total_cells: 0,
          valid_cells: 0,
          expiring_cells: 0,
          expired_cells: 0,
          missing_cells: 0,
          global_score: 100,
        },
      };
    }

    // 2. Fetch all non-archived registre_entries for formations + habilitations
    const { data: allEntries, error: entriesError } = await client
      .from('registre_entries')
      .select('*, registres!inner(id, company_id, type)')
      .eq('registres.company_id', companyId)
      .eq('is_archived', false)
      .in('registres.type', ['formations', 'habilitations']);

    if (entriesError) throw entriesError;
    const entries = allEntries || [];

    // 3. Extract unique employees
    const employeeMap = new Map<string, { nom: string; poste: string | null; site: string | null }>();
    for (const entry of entries) {
      const data = entry.data as Record<string, any>;
      const nom = data?.salarie_nom;
      if (nom && !employeeMap.has(nom)) {
        employeeMap.set(nom, {
          nom,
          poste: data?.salarie_poste || null,
          site: null,
        });
      }
    }

    // Apply search filter
    let employees = Array.from(employeeMap.values());
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      employees = employees.filter(
        (e) =>
          e.nom.toLowerCase().includes(searchLower) ||
          (e.poste && e.poste.toLowerCase().includes(searchLower)),
      );
    }

    // Sort alphabetically
    employees.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));

    const now = new Date();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    // 4. Build the matrix
    const rows: ConformiteRow[] = employees.map((employee) => {
      const cells: ConformiteCell[] = formationTypes.map((ft: any) => {
        // Find matching entries for this employee + formation type
        const matchingEntries = entries.filter((entry) => {
          const data = entry.data as Record<string, any>;
          const registreType = (entry as any).registres?.type;

          // Must be same employee
          if (data?.salarie_nom !== employee.nom) return false;

          // Must match registre type
          if (registreType !== ft.match_registre_type) return false;

          // Match on the relevant field
          if (ft.match_registre_type === 'habilitations') {
            // Match on type_habilitation
            return data?.type_habilitation === ft.match_field_value;
          } else {
            // Match on intitule (partial, case-insensitive)
            const intitule = (data?.intitule || '').toLowerCase();
            return intitule.includes(ft.match_field_value.toLowerCase());
          }
        });

        if (matchingEntries.length === 0) {
          return {
            formation_type_id: ft.id,
            formation_type_code: ft.code,
            status: 'missing' as ConformiteStatus,
            registre_entry_id: null,
            expires_at: null,
            days_remaining: null,
            last_date: null,
          };
        }

        // Find the most recent entry
        const sorted = [...matchingEntries].sort((a, b) => {
          const dateA = a.expires_at || a.created_at;
          const dateB = b.expires_at || b.created_at;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
        const latest = sorted[0];

        // If no validity period (duree_validite_mois = 0 or null), always valid
        if (!ft.duree_validite_mois || ft.duree_validite_mois === 0) {
          return {
            formation_type_id: ft.id,
            formation_type_code: ft.code,
            status: 'valid' as ConformiteStatus,
            registre_entry_id: latest.id,
            expires_at: null,
            days_remaining: null,
            last_date: latest.expires_at || latest.created_at,
          };
        }

        // Determine expiration
        const expiresAt = latest.expires_at;
        if (!expiresAt) {
          // Entry exists but no expiry date — calculate from data
          const entryData = latest.data as Record<string, any>;
          let baseDate: string | null = null;
          if (ft.match_registre_type === 'habilitations') {
            baseDate = entryData?.date_obtention || entryData?.date_expiration;
          } else {
            baseDate = entryData?.date_fin || entryData?.date_debut;
          }

          if (baseDate) {
            const calculated = new Date(baseDate);
            calculated.setMonth(calculated.getMonth() + ft.duree_validite_mois);
            const daysRemaining = Math.floor(
              (calculated.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
            );

            let status: ConformiteStatus;
            if (daysRemaining < 0) status = 'expired';
            else if (daysRemaining <= 30) status = 'expiring';
            else status = 'valid';

            return {
              formation_type_id: ft.id,
              formation_type_code: ft.code,
              status,
              registre_entry_id: latest.id,
              expires_at: calculated.toISOString().split('T')[0],
              days_remaining: daysRemaining,
              last_date: baseDate,
            };
          }

          // No date info at all — consider valid
          return {
            formation_type_id: ft.id,
            formation_type_code: ft.code,
            status: 'valid' as ConformiteStatus,
            registre_entry_id: latest.id,
            expires_at: null,
            days_remaining: null,
            last_date: latest.created_at,
          };
        }

        // Use expires_at from entry
        const expiryDate = new Date(expiresAt);
        const daysRemaining = Math.floor(
          (expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
        );

        let status: ConformiteStatus;
        if (daysRemaining < 0) status = 'expired';
        else if (daysRemaining <= 30) status = 'expiring';
        else status = 'valid';

        return {
          formation_type_id: ft.id,
          formation_type_code: ft.code,
          status,
          registre_entry_id: latest.id,
          expires_at: expiresAt,
          days_remaining: daysRemaining,
          last_date: expiresAt,
        };
      });

      // Apply status filter if specified
      const validCount = cells.filter((c) => c.status === 'valid').length;
      const expiringCount = cells.filter((c) => c.status === 'expiring').length;
      const expiredCount = cells.filter((c) => c.status === 'expired').length;
      const missingCount = cells.filter((c) => c.status === 'missing').length;
      const totalCells = cells.length;
      const score = totalCells > 0 ? Math.round((validCount / totalCells) * 100) : 100;

      return {
        salarie_nom: employee.nom,
        salarie_poste: employee.poste,
        site_name: employee.site,
        cells,
        valid_count: validCount,
        expiring_count: expiringCount,
        expired_count: expiredCount,
        missing_count: missingCount,
        score,
      };
    });

    // Apply status filter on rows
    let filteredRows = rows;
    if (filters?.status) {
      filteredRows = rows.filter((row) =>
        row.cells.some((c) => c.status === filters.status),
      );
    }

    // 5. Build summary
    const allCells = filteredRows.flatMap((r) => r.cells);
    const summary: ConformiteSummary = {
      total_employees: filteredRows.length,
      total_types: formationTypes.length,
      total_cells: allCells.length,
      valid_cells: allCells.filter((c) => c.status === 'valid').length,
      expiring_cells: allCells.filter((c) => c.status === 'expiring').length,
      expired_cells: allCells.filter((c) => c.status === 'expired').length,
      missing_cells: allCells.filter((c) => c.status === 'missing').length,
      global_score:
        allCells.length > 0
          ? Math.round(
              (allCells.filter((c) => c.status === 'valid').length / allCells.length) * 100,
            )
          : 100,
    };

    return {
      columns: formationTypes,
      rows: filteredRows,
      summary,
    };
  }

  // ─── Stats (KPIs) ─────────────────────────────────

  async getFormationStats(companyId: string): Promise<FormationStats> {
    const matrix = await this.getConformiteMatrix(companyId);

    // Count by formation vs habilitation category
    let formationsValid = 0;
    let formationsExpiring = 0;
    let formationsExpired = 0;
    let habilitationsValid = 0;
    let habilitationsExpiring = 0;
    let habilitationsExpired = 0;
    let obligatoiresManquantes = 0;

    for (const row of matrix.rows) {
      for (const cell of row.cells) {
        const col = matrix.columns.find((c: any) => c.id === cell.formation_type_id);
        if (!col) continue;
        const isFormation = (col as any).category === 'formation';

        if (cell.status === 'valid') {
          if (isFormation) formationsValid++;
          else habilitationsValid++;
        } else if (cell.status === 'expiring') {
          if (isFormation) formationsExpiring++;
          else habilitationsExpiring++;
        } else if (cell.status === 'expired') {
          if (isFormation) formationsExpired++;
          else habilitationsExpired++;
        } else if (cell.status === 'missing' && (col as any).is_obligatoire) {
          obligatoiresManquantes++;
        }
      }
    }

    return {
      total_salaries: matrix.summary.total_employees,
      formations_valid: formationsValid,
      formations_expiring: formationsExpiring,
      formations_expired: formationsExpired,
      habilitations_valid: habilitationsValid,
      habilitations_expiring: habilitationsExpiring,
      habilitations_expired: habilitationsExpired,
      global_score: matrix.summary.global_score,
      obligatoires_manquantes: obligatoiresManquantes,
    };
  }

  // ─── Rapport Inspection ────────────────────────────

  async getRapportData(companyId: string, companyName: string): Promise<FormationRapportData> {
    const [stats, matrix, types] = await Promise.all([
      this.getFormationStats(companyId),
      this.getConformiteMatrix(companyId),
      this.findActiveTypes(companyId),
    ]);

    return {
      company_name: companyName,
      generated_at: new Date().toISOString(),
      stats,
      matrix,
      formation_types: types,
    };
  }
}
