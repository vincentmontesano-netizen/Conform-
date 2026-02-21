import { Controller, Post, Body, InternalServerErrorException } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';

@Controller('knowledge')
export class KnowledgeController {
    constructor(private readonly knowledgeService: KnowledgeService) { }

    /** POST /knowledge/sync
     *  Appelé par le front-end admin juste après avoir uploadé le fichier
     *  dans Supabase Storage et enregistré l'entrée 'pending' dans `knowledge_documents`.
     */
    @Post('sync')
    async syncDocument(@Body() body: { documentId: string }) {
        if (!body.documentId) {
            throw new InternalServerErrorException('documentId manquant');
        }

        try {
            return await this.knowledgeService.syncWithMistral(body.documentId);
        } catch (err: any) {
            throw new InternalServerErrorException(err.message);
        }
    }
}
