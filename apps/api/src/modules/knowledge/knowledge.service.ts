import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class KnowledgeService {
    private readonly logger = new Logger(KnowledgeService.name);
    private mistralApiKey: string;

    constructor(private readonly supabaseService: SupabaseService) {
        this.mistralApiKey = process.env.MISTRAL_API_KEY || '';
        if (!this.mistralApiKey) {
            this.logger.warn('MISTRAL_API_KEY non configurée. La synchro RAG échouera.');
        }
    }

    /**
     * Synchronise un document (déjà uploadé dans Supabase Storage) avec Mistral API.
     * 1. Télécharge le buffer depuis Supabase
     * 2. Upload vers Mistral API (/v1/files)
     * 3. Met à jour le mistral_file_id en base Supabase
     */
    async syncWithMistral(documentId: string) {
        const client = this.supabaseService.getClient();

        try {
            // 1. Récupérer l'entrée en BDD
            const { data: doc, error: docErr } = await client
                .from('knowledge_documents')
                .select('*')
                .eq('id', documentId)
                .single();

            if (docErr || !doc) {
                throw new Error('Document introuvable en base');
            }

            // 2. Télécharger le fichier depuis le bucket knowledge_base
            const { data: fileBlob, error: storageErr } = await client.storage
                .from('knowledge_base')
                .download(doc.file_url);

            if (storageErr || !fileBlob) {
                throw new Error('Erreur téléchargement Storage : ' + storageErr?.message);
            }

            // 3. Upload vers Mistral /v1/files
            const formData = new FormData();
            formData.append('file', fileBlob, doc.title);
            formData.append('purpose', 'retrieval'); // Requis pour le RAG

            const mistralRes = await fetch('https://api.mistral.ai/v1/files', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.mistralApiKey}`,
                },
                body: formData,
            });

            if (!mistralRes.ok) {
                const errText = await mistralRes.text();
                this.logger.error('Mistral Upload Error:', errText);
                throw new Error(`Erreur API Mistral (${mistralRes.status})`);
            }

            const mistralData = await mistralRes.json();
            const mistralFileId = mistralData.id;

            // 4. Mettre à jour la base
            await client
                .from('knowledge_documents')
                .update({ mistral_file_id: mistralFileId, status: 'synced' })
                .eq('id', documentId);

            return { success: true, mistral_file_id: mistralFileId };

        } catch (error: any) {
            this.logger.error(`Erreur de synchro doc ${documentId} :`, error.message);

            // Marquer comme erreur
            await client
                .from('knowledge_documents')
                .update({ status: 'error' })
                .eq('id', documentId);

            throw error;
        }
    }
}
