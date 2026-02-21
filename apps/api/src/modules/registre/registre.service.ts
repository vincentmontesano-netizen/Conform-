import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';
import { UploadService } from '../upload/upload.service';
import { CreateRegistreDto, UpdateRegistreDto } from './dto/create-registre.dto';
import { CreateRegistreEntryDto, UpdateRegistreEntryDto } from './dto/create-registre-entry.dto';
import {
  REGISTRE_TEMPLATES,
  RegistreType,
  REGISTRE_TYPE_LABELS,
} from '@conform-plus/shared';

@Injectable()
export class RegistreService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly uploadService: UploadService,
  ) {}

  // ─── Registres CRUD ────────────────────────────────

  async findAll(companyId: string, type?: string) {
    const client = this.supabaseService.getClient();
    let query = client
      .from('registres')
      .select('*, registre_entries(id)', { count: 'exact' })
      .eq('company_id', companyId)
      .order('type', { ascending: true });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Add entry count
    return (data || []).map((r: any) => ({
      ...r,
      entries_count: r.registre_entries?.length || 0,
      registre_entries: undefined,
    }));
  }

  async findOne(id: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('registres')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('Registre non trouve');
    return data;
  }

  async create(dto: CreateRegistreDto, user: any) {
    const client = this.supabaseService.getClient();

    // Validate type
    if (!Object.values(RegistreType).includes(dto.type as RegistreType)) {
      throw new BadRequestException(`Type de registre invalide: ${dto.type}`);
    }

    // Auto-name from template if not provided
    const name = dto.name || REGISTRE_TYPE_LABELS[dto.type as RegistreType];

    const { data, error } = await client
      .from('registres')
      .insert({
        company_id: user.company_id,
        site_id: dto.site_id || null,
        type: dto.type,
        name,
        description: dto.description || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new BadRequestException('Un registre de ce type existe deja pour cette entreprise/site');
      }
      throw error;
    }

    return data;
  }

  async update(id: string, dto: UpdateRegistreDto) {
    const client = this.supabaseService.getClient();
    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.is_active !== undefined) updateData.is_active = dto.is_active;

    const { data, error } = await client
      .from('registres')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('Registre non trouve');
    return data;
  }

  async delete(id: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client.from('registres').delete().eq('id', id);
    if (error) throw error;
    return { deleted: true };
  }

  // ─── Entries CRUD ──────────────────────────────────

  async findEntries(registreId: string, options: { archived?: boolean; page?: number; limit?: number } = {}) {
    const client = this.supabaseService.getClient();
    const page = options.page || 1;
    const limit = options.limit || 50;
    const offset = (page - 1) * limit;

    let query = client
      .from('registre_entries')
      .select('*, registre_entry_documents(*)', { count: 'exact' })
      .eq('registre_id', registreId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (options.archived !== undefined) {
      query = query.eq('is_archived', options.archived);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      entries: data || [],
      total: count || 0,
      page,
      limit,
    };
  }

  async createEntry(registreId: string, dto: CreateRegistreEntryDto, user: any) {
    const client = this.supabaseService.getClient();

    // Get registre to know the type (for expiry field extraction)
    const registre = await this.findOne(registreId);
    const template = REGISTRE_TEMPLATES[registre.type as RegistreType];

    // Extract expiry date from data if template defines an expiry field
    let expiresAt: string | null = null;
    if (template?.expiryFieldName && dto.data[template.expiryFieldName]) {
      expiresAt = dto.data[template.expiryFieldName] as string;
    }

    const { data, error } = await client
      .from('registre_entries')
      .insert({
        registre_id: registreId,
        data: dto.data,
        expires_at: dto.expires_at || expiresAt,
        created_by: user.id,
      })
      .select('*, registre_entry_documents(*)')
      .single();

    if (error) throw error;
    return data;
  }

  async updateEntry(registreId: string, entryId: string, dto: UpdateRegistreEntryDto) {
    const client = this.supabaseService.getClient();
    const updateData: Record<string, unknown> = {};

    if (dto.data !== undefined) {
      updateData.data = dto.data;

      // Re-extract expiry date
      const registre = await this.findOne(registreId);
      const template = REGISTRE_TEMPLATES[registre.type as RegistreType];
      if (template?.expiryFieldName && dto.data[template.expiryFieldName]) {
        updateData.expires_at = dto.data[template.expiryFieldName];
      }
    }
    if (dto.expires_at !== undefined) updateData.expires_at = dto.expires_at;
    if (dto.is_archived !== undefined) updateData.is_archived = dto.is_archived;

    const { data, error } = await client
      .from('registre_entries')
      .update(updateData)
      .eq('id', entryId)
      .eq('registre_id', registreId)
      .select('*, registre_entry_documents(*)')
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('Entree non trouvee');
    return data;
  }

  async archiveEntry(registreId: string, entryId: string) {
    return this.updateEntry(registreId, entryId, { is_archived: true });
  }

  // ─── Documents ─────────────────────────────────────

  async addDocument(entryId: string, file: Express.Multer.File, user: any) {
    // Upload file via existing UploadService
    const uploaded = await this.uploadService.uploadProof(file, user.id);

    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('registre_entry_documents')
      .insert({
        entry_id: entryId,
        filename: uploaded.filename,
        url: uploaded.url,
        file_type: file.mimetype,
        file_size: file.size,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removeDocument(docId: string) {
    const client = this.supabaseService.getClient();

    // Get doc to delete file from storage
    const { data: doc } = await client
      .from('registre_entry_documents')
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
      .from('registre_entry_documents')
      .delete()
      .eq('id', docId);

    if (error) throw error;
    return { deleted: true };
  }

  // ─── Expiry ────────────────────────────────────────

  async getExpiringEntries(companyId: string, days: number = 30) {
    const client = this.supabaseService.getClient();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await client
      .from('registre_entries')
      .select('*, registres!inner(id, company_id, type, name)')
      .eq('registres.company_id', companyId)
      .eq('is_archived', false)
      .not('expires_at', 'is', null)
      .lte('expires_at', futureDate.toISOString().split('T')[0])
      .order('expires_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // ─── Export ────────────────────────────────────────

  async exportRegistre(id: string) {
    const registre = await this.findOne(id);
    const template = REGISTRE_TEMPLATES[registre.type as RegistreType];

    const client = this.supabaseService.getClient();
    const { data: entries } = await client
      .from('registre_entries')
      .select('*, registre_entry_documents(*)')
      .eq('registre_id', id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    return {
      registre,
      template,
      entries: entries || [],
      exportedAt: new Date().toISOString(),
    };
  }
}
