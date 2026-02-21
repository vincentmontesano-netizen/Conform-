import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class ChatbotService {
    private readonly logger = new Logger(ChatbotService.name);
    private mistralApiKey: string;
    private mistralAgentId: string;

    constructor() {
        this.mistralApiKey = process.env.MISTRAL_API_KEY || '';
        this.mistralAgentId = process.env.MISTRAL_AGENT_ID || '';

        if (!this.mistralApiKey || !this.mistralAgentId) {
            this.logger.warn('Clés Mistral manquantes. Le chatbot risque de ne pas fonctionner.');
        }
    }

    async processMessage(messages: { role: string; content: string }[]) {
        if (!this.mistralApiKey || !this.mistralAgentId) {
            throw new InternalServerErrorException('API RAG non configurée sur le serveur.');
        }

        try {
            // Les instructions système d'encadrement juridique (Règles d'or)
            const systemPrompt = {
                role: 'system',
                content: `Tu es l'assistant juridique expert de CONFORM+. Ton rôle est d'aider à la conformité réglementaire.
Tu dois formuler ta réponse en te basant EXCLUSIVEMENT sur les documents fournis dans ta base de connaissances de l'agent AI de l'API mistral.
Tu dois citer uniquement les sources internes. Chaque affirmation doit être justifiée avec le nom du document et sa catégorie.
Tu ne génères JAMAIS de contenu hors du corpus validé. Si la réponse ne se trouve pas dans les documents, tu DOIS répondre exactement : "Je ne trouve pas cette information dans la base documentaire validée de CONFORM+."`
            };

            const payload = {
                agent_id: this.mistralAgentId,
                messages: [systemPrompt, ...messages],
            };

            const res = await fetch('https://api.mistral.ai/v1/agents/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.mistralApiKey}`,
                    Accept: 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errText = await res.text();
                this.logger.error('Erreur API Mistral Agent:', errText);
                throw new Error('Erreur de génération Mistral');
            }

            const data = await res.json();
            const assistantMessage = data.choices[0].message.content;

            // Extract sources if Mistral provided citations.
            // Dans certains cas l'API Mistral renvoie les sources dans data.choices[0].message.tool_calls si le RAG est configuré en retrieval.
            // Pour ce MVP, si on force la citation dans le prompt de texte, on la récupère simplement depuis la string, mais on peut simuler un fallback "Sources" mocké si non présent en structuré.
            let sources: string[] = [];
            const sourcesMatch = assistantMessage.match(/Source(s)?\s*:\s*(.*)/i);
            if (sourcesMatch && sourcesMatch[2]) {
                sources = sourcesMatch[2].split(',').map((s: string) => s.trim());
            }

            return {
                content: assistantMessage,
                sources,
            };
        } catch (error: any) {
            this.logger.error('ChatbotService processMessage error:', error.message);
            throw new InternalServerErrorException('Erreur de communication avec le moteur RAG.');
        }
    }
}
