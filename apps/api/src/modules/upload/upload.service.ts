import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  private readonly BUCKET = 'proofs';
  private readonly MAX_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

  constructor(private readonly supabaseService: SupabaseService) {}

  async uploadProof(file: Express.Multer.File, userId: string): Promise<{ url: string; filename: string }> {
    if (!file) throw new BadRequestException('Fichier requis');
    if (file.size > this.MAX_SIZE) throw new BadRequestException('Fichier trop volumineux (max 10 Mo)');
    if (!this.ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Type de fichier non autorise (PDF, PNG, JPG uniquement)');
    }

    const ext = file.originalname.split('.').pop() || 'pdf';
    const filename = `${userId}/${randomUUID()}.${ext}`;

    const client = this.supabaseService.getClient();
    const { error } = await client.storage
      .from(this.BUCKET)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = client.storage
      .from(this.BUCKET)
      .getPublicUrl(filename);

    return { url: urlData.publicUrl, filename };
  }

  async deleteProof(filename: string): Promise<void> {
    const client = this.supabaseService.getClient();
    const { error } = await client.storage
      .from(this.BUCKET)
      .remove([filename]);

    if (error) throw error;
  }
}
