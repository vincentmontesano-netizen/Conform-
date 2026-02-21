import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';
import { UploadService } from '../upload/upload.service';
import { CreateEpiCategoryDto, UpdateEpiCategoryDto } from './dto/create-epi-category.dto';
import { CreateEpiItemDto, UpdateEpiItemDto } from './dto/create-epi-item.dto';
import { CreateEpiAttributionDto, UpdateEpiAttributionDto } from './dto/create-epi-attribution.dto';
import { CreateEpiControleDto } from './dto/create-epi-controle.dto';
import { EPI_CATEGORY_PRESETS } from '@conform-plus/shared';

@Injectable()
export class EpiService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly uploadService: UploadService,
  ) {}

  // ─── Categories CRUD ────────────────────────────────

  async findAllCategories(companyId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('epi_categories')
      .select('*, epi_items(id)')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;

    return (data || []).map((c: any) => ({
      ...c,
      items_count: c.epi_items?.length || 0,
      epi_items: undefined,
    }));
  }

  async findOneCategory(id: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('epi_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('Categorie EPI non trouvee');
    return data;
  }

  async createCategory(dto: CreateEpiCategoryDto, user: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('epi_categories')
      .insert({
        company_id: user.company_id,
        name: dto.name,
        code: dto.code || null,
        description: dto.description || null,
        norme: dto.norme || null,
        duree_vie_mois: dto.duree_vie_mois || null,
        controle_periodique_mois: dto.controle_periodique_mois || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCategory(id: string, dto: UpdateEpiCategoryDto) {
    const client = this.supabaseService.getClient();
    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.code !== undefined) updateData.code = dto.code;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.norme !== undefined) updateData.norme = dto.norme;
    if (dto.duree_vie_mois !== undefined) updateData.duree_vie_mois = dto.duree_vie_mois;
    if (dto.controle_periodique_mois !== undefined) updateData.controle_periodique_mois = dto.controle_periodique_mois;
    if (dto.is_active !== undefined) updateData.is_active = dto.is_active;

    const { data, error } = await client
      .from('epi_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('Categorie EPI non trouvee');
    return data;
  }

  async deleteCategory(id: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client.from('epi_categories').delete().eq('id', id);
    if (error) throw error;
    return { deleted: true };
  }

  async initFromPresets(user: any) {
    const client = this.supabaseService.getClient();

    // Get existing categories to avoid duplicates
    const { data: existing } = await client
      .from('epi_categories')
      .select('code')
      .eq('company_id', user.company_id);

    const existingCodes = new Set((existing || []).map((c: any) => c.code));

    const toInsert = EPI_CATEGORY_PRESETS
      .filter((p) => !existingCodes.has(p.code))
      .map((p) => ({
        company_id: user.company_id,
        name: p.name,
        code: p.code,
        description: p.description,
        norme: p.norme,
        duree_vie_mois: p.duree_vie_mois,
        controle_periodique_mois: p.controle_periodique_mois,
      }));

    if (toInsert.length === 0) {
      return { created: 0, message: 'Toutes les categories existent deja' };
    }

    const { data, error } = await client
      .from('epi_categories')
      .insert(toInsert)
      .select();

    if (error) throw error;
    return { created: (data || []).length, categories: data };
  }

  // ─── Items CRUD ─────────────────────────────────────

  async findAllItems(
    companyId: string,
    filters: { statut?: string; etat?: string; category_id?: string; site_id?: string; page?: number; limit?: number } = {},
  ) {
    const client = this.supabaseService.getClient();
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;

    let query = client
      .from('epi_items')
      .select('*, epi_categories(id, name, code, norme, duree_vie_mois)', { count: 'exact' })
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters.statut) query = query.eq('statut', filters.statut);
    if (filters.etat) query = query.eq('etat', filters.etat);
    if (filters.category_id) query = query.eq('category_id', filters.category_id);
    if (filters.site_id) query = query.eq('site_id', filters.site_id);

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      items: data || [],
      total: count || 0,
      page,
      limit,
    };
  }

  async findOneItem(id: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('epi_items')
      .select(`
        *,
        epi_categories(id, name, code, norme, duree_vie_mois, controle_periodique_mois),
        epi_attributions(*, epi_documents:epi_documents(id, filename, url, file_type, file_size)),
        epi_controles(*, epi_documents:epi_documents(id, filename, url, file_type, file_size)),
        epi_documents(id, filename, url, file_type, file_size, uploaded_at)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('EPI non trouve');
    return data;
  }

  async createItem(dto: CreateEpiItemDto, user: any) {
    const client = this.supabaseService.getClient();

    // Fetch category to auto-calculate dates
    const category = await this.findOneCategory(dto.category_id);

    // Auto-calculate date_expiration from date_achat + duree_vie_mois
    let dateExpiration = dto.date_expiration || null;
    if (!dateExpiration && dto.date_achat && category.duree_vie_mois) {
      const achat = new Date(dto.date_achat);
      achat.setMonth(achat.getMonth() + category.duree_vie_mois);
      dateExpiration = achat.toISOString().split('T')[0];
    }

    // Auto-calculate date_prochain_controle from date_mise_en_service + controle_periodique_mois
    let dateProchainControle: string | null = null;
    if (dto.date_mise_en_service && category.controle_periodique_mois) {
      const mise = new Date(dto.date_mise_en_service);
      mise.setMonth(mise.getMonth() + category.controle_periodique_mois);
      dateProchainControle = mise.toISOString().split('T')[0];
    } else if (dto.date_achat && category.controle_periodique_mois) {
      const achat = new Date(dto.date_achat);
      achat.setMonth(achat.getMonth() + category.controle_periodique_mois);
      dateProchainControle = achat.toISOString().split('T')[0];
    }

    const { data, error } = await client
      .from('epi_items')
      .insert({
        company_id: user.company_id,
        site_id: dto.site_id || null,
        category_id: dto.category_id,
        reference: dto.reference || null,
        taille: dto.taille || null,
        date_achat: dto.date_achat || null,
        date_fabrication: dto.date_fabrication || null,
        date_expiration: dateExpiration,
        date_mise_en_service: dto.date_mise_en_service || null,
        date_prochain_controle: dateProchainControle,
        etat: dto.etat || 'neuf',
        statut: dto.statut || 'en_stock',
        quantite: dto.quantite || 1,
        notes: dto.notes || null,
        created_by: user.id,
      })
      .select('*, epi_categories(id, name, code, norme)')
      .single();

    if (error) throw error;
    return data;
  }

  async updateItem(id: string, dto: UpdateEpiItemDto) {
    const client = this.supabaseService.getClient();
    const updateData: Record<string, unknown> = {};

    if (dto.category_id !== undefined) updateData.category_id = dto.category_id;
    if (dto.site_id !== undefined) updateData.site_id = dto.site_id;
    if (dto.reference !== undefined) updateData.reference = dto.reference;
    if (dto.taille !== undefined) updateData.taille = dto.taille;
    if (dto.date_achat !== undefined) updateData.date_achat = dto.date_achat;
    if (dto.date_fabrication !== undefined) updateData.date_fabrication = dto.date_fabrication;
    if (dto.date_expiration !== undefined) updateData.date_expiration = dto.date_expiration;
    if (dto.date_mise_en_service !== undefined) updateData.date_mise_en_service = dto.date_mise_en_service;
    if (dto.date_dernier_controle !== undefined) updateData.date_dernier_controle = dto.date_dernier_controle;
    if (dto.date_prochain_controle !== undefined) updateData.date_prochain_controle = dto.date_prochain_controle;
    if (dto.etat !== undefined) updateData.etat = dto.etat;
    if (dto.statut !== undefined) updateData.statut = dto.statut;
    if (dto.quantite !== undefined) updateData.quantite = dto.quantite;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const { data, error } = await client
      .from('epi_items')
      .update(updateData)
      .eq('id', id)
      .select('*, epi_categories(id, name, code, norme)')
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('EPI non trouve');
    return data;
  }

  async deleteItem(id: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client.from('epi_items').delete().eq('id', id);
    if (error) throw error;
    return { deleted: true };
  }

  async getExpiringItems(companyId: string, days: number = 30) {
    const client = this.supabaseService.getClient();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const { data, error } = await client
      .from('epi_items')
      .select('*, epi_categories(id, name, code, norme)')
      .eq('company_id', companyId)
      .or(`date_expiration.lte.${futureDateStr},date_prochain_controle.lte.${futureDateStr}`)
      .not('statut', 'in', '("retire","perdu")')
      .order('date_expiration', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getStats(companyId: string) {
    const client = this.supabaseService.getClient();
    const today = new Date().toISOString().split('T')[0];
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    const thirtyDaysStr = thirtyDays.toISOString().split('T')[0];

    const [totalRes, expiringRes, nonConformeRes] = await Promise.all([
      client.from('epi_items').select('id, statut, etat', { count: 'exact' }).eq('company_id', companyId),
      client.from('epi_items')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .not('statut', 'in', '("retire","perdu")')
        .not('date_expiration', 'is', null)
        .lte('date_expiration', thirtyDaysStr),
      client.from('epi_items')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('etat', 'a_remplacer'),
    ]);

    const items = totalRes.data || [];
    const byStatut: Record<string, number> = {};
    const byEtat: Record<string, number> = {};
    for (const item of items) {
      byStatut[item.statut] = (byStatut[item.statut] || 0) + 1;
      byEtat[item.etat] = (byEtat[item.etat] || 0) + 1;
    }

    return {
      total: totalRes.count || 0,
      by_statut: byStatut,
      by_etat: byEtat,
      expiring: expiringRes.count || 0,
      non_conforme: nonConformeRes.count || 0,
    };
  }

  // ─── Attributions ───────────────────────────────────

  async findAllAttributions(companyId: string, filters: { salarie_nom?: string; epi_item_id?: string; page?: number; limit?: number } = {}) {
    const client = this.supabaseService.getClient();
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;

    let query = client
      .from('epi_attributions')
      .select('*, epi_items!inner(id, company_id, reference, epi_categories(id, name))', { count: 'exact' })
      .eq('epi_items.company_id', companyId)
      .order('date_attribution', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters.salarie_nom) query = query.ilike('salarie_nom', `%${filters.salarie_nom}%`);
    if (filters.epi_item_id) query = query.eq('epi_item_id', filters.epi_item_id);

    const { data, count, error } = await query;
    if (error) throw error;

    return { attributions: data || [], total: count || 0, page, limit };
  }

  async findOneAttribution(id: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('epi_attributions')
      .select('*, epi_items(id, reference, epi_categories(id, name))')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('Attribution non trouvee');
    return data;
  }

  async createAttribution(dto: CreateEpiAttributionDto, user: any) {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('epi_attributions')
      .insert({
        epi_item_id: dto.epi_item_id,
        salarie_nom: dto.salarie_nom,
        salarie_poste: dto.salarie_poste || null,
        date_attribution: dto.date_attribution,
        date_retour: dto.date_retour || null,
        motif: dto.motif || null,
        attribue_par: dto.attribue_par,
        signature_salarie: dto.signature_salarie || false,
        notes: dto.notes || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Update item statut to 'attribue' if no return date
    if (!dto.date_retour) {
      await client
        .from('epi_items')
        .update({ statut: 'attribue' })
        .eq('id', dto.epi_item_id);
    }

    return data;
  }

  async updateAttribution(id: string, dto: UpdateEpiAttributionDto) {
    const client = this.supabaseService.getClient();
    const updateData: Record<string, unknown> = {};
    if (dto.date_retour !== undefined) updateData.date_retour = dto.date_retour;
    if (dto.motif !== undefined) updateData.motif = dto.motif;
    if (dto.signature_salarie !== undefined) updateData.signature_salarie = dto.signature_salarie;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const { data, error } = await client
      .from('epi_attributions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('Attribution non trouvee');

    // If return date is set, update item statut back to 'en_stock'
    if (dto.date_retour) {
      await client
        .from('epi_items')
        .update({ statut: 'en_stock' })
        .eq('id', (data as any).epi_item_id);
    }

    return data;
  }

  // ─── Controles ──────────────────────────────────────

  async findAllControles(companyId: string, filters: { epi_item_id?: string; page?: number; limit?: number } = {}) {
    const client = this.supabaseService.getClient();
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;

    let query = client
      .from('epi_controles')
      .select('*, epi_items!inner(id, company_id, reference, epi_categories(id, name))', { count: 'exact' })
      .eq('epi_items.company_id', companyId)
      .order('date_controle', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters.epi_item_id) query = query.eq('epi_item_id', filters.epi_item_id);

    const { data, count, error } = await query;
    if (error) throw error;

    return { controles: data || [], total: count || 0, page, limit };
  }

  async findOneControle(id: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('epi_controles')
      .select('*, epi_items(id, reference, epi_categories(id, name))')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('Controle non trouve');
    return data;
  }

  async createControle(dto: CreateEpiControleDto, user: any) {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('epi_controles')
      .insert({
        epi_item_id: dto.epi_item_id,
        date_controle: dto.date_controle,
        controleur: dto.controleur,
        resultat: dto.resultat,
        observations: dto.observations || null,
        prochain_controle: dto.prochain_controle || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Update item dates and etat based on result
    const itemUpdate: Record<string, unknown> = {
      date_dernier_controle: dto.date_controle,
    };

    if (dto.prochain_controle) {
      itemUpdate.date_prochain_controle = dto.prochain_controle;
    } else {
      // Auto-calculate from category
      const { data: item } = await client
        .from('epi_items')
        .select('epi_categories(controle_periodique_mois)')
        .eq('id', dto.epi_item_id)
        .single();

      const months = (item as any)?.epi_categories?.controle_periodique_mois;
      if (months) {
        const next = new Date(dto.date_controle);
        next.setMonth(next.getMonth() + months);
        itemUpdate.date_prochain_controle = next.toISOString().split('T')[0];
      }
    }

    // If non-conforme, mark item for replacement
    if (dto.resultat === 'non_conforme') {
      itemUpdate.etat = 'a_remplacer';
    }

    await client
      .from('epi_items')
      .update(itemUpdate)
      .eq('id', dto.epi_item_id);

    return data;
  }

  // ─── Documents ──────────────────────────────────────

  async addDocument(
    parentType: 'item' | 'attribution' | 'controle',
    parentId: string,
    file: Express.Multer.File,
    user: any,
  ) {
    const uploaded = await this.uploadService.uploadProof(file, user.id);

    const client = this.supabaseService.getClient();
    const insertData: Record<string, unknown> = {
      filename: uploaded.filename,
      url: uploaded.url,
      file_type: file.mimetype,
      file_size: file.size,
      uploaded_by: user.id,
    };

    if (parentType === 'item') insertData.epi_item_id = parentId;
    else if (parentType === 'attribution') insertData.epi_attribution_id = parentId;
    else if (parentType === 'controle') insertData.epi_controle_id = parentId;

    const { data, error } = await client
      .from('epi_documents')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removeDocument(docId: string) {
    const client = this.supabaseService.getClient();

    const { data: doc } = await client
      .from('epi_documents')
      .select('filename')
      .eq('id', docId)
      .single();

    if (doc?.filename) {
      try {
        await this.uploadService.deleteProof(doc.filename);
      } catch {
        // Silent: file might already be deleted
      }
    }

    const { error } = await client
      .from('epi_documents')
      .delete()
      .eq('id', docId);

    if (error) throw error;
    return { deleted: true };
  }

  // ─── Attestation / Export ───────────────────────────

  async getAttestationData(itemId: string) {
    const item = await this.findOneItem(itemId);

    return {
      item,
      exportedAt: new Date().toISOString(),
    };
  }
}
