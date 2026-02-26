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

    /** Vérifie la configuration Mistral (sans exposer les clés) */
    checkConfig() {
        const hasKey = !!this.mistralApiKey;
        const hasAgent = !!this.mistralAgentId;
        const agentIdPreview = this.mistralAgentId
            ? `${this.mistralAgentId.slice(0, 12)}...`
            : null;
        return {
            configured: hasKey && hasAgent,
            agentId: agentIdPreview,
            message: hasKey && hasAgent
                ? 'Mistral Agent connecté'
                : !hasKey
                    ? 'MISTRAL_API_KEY manquante'
                    : 'MISTRAL_AGENT_ID manquant',
        };
    }

    async processMessage(messages: { role: string; content: string }[]) {
        if (!this.mistralApiKey || !this.mistralAgentId) {
            throw new InternalServerErrorException('API RAG non configurée sur le serveur.');
        }

        try {
            // L'API Mistral Agents utilise les instructions configurées sur l'agent (dashboard)
            // On n'envoie que les messages user/assistant (pas de rôle system)
            const payload = {
                agent_id: this.mistralAgentId,
                messages: messages.map((m) => ({
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.content,
                })),
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
                this.logger.error(`Erreur API Mistral (${res.status}):`, errText);
                let errJson: { error?: { message?: string } };
                try {
                    errJson = JSON.parse(errText);
                } catch {
                    errJson = {};
                }
                const msg = errJson?.error?.message || errText?.slice(0, 200) || 'Erreur Mistral';
                throw new InternalServerErrorException(`Mistral: ${msg}`);
            }

            const data = await res.json();
            const firstChoice = data?.choices?.[0];
            const assistantMessage = firstChoice?.message?.content ?? '';

            if (!assistantMessage && firstChoice) {
                this.logger.warn('Réponse Mistral sans contenu:', JSON.stringify(data).slice(0, 500));
            }

            // Extract sources from response text if present
            let sources: string[] = [];
            const sourcesMatch = assistantMessage.match(/Source(s)?\s*:\s*(.*)/i);
            if (sourcesMatch && sourcesMatch[2]) {
                sources = sourcesMatch[2].split(',').map((s: string) => s.trim());
            }

            return {
                content: assistantMessage || 'Réponse vide reçue de l\'assistant.',
                sources,
            };
        } catch (error: any) {
            this.logger.error('ChatbotService processMessage error:', error?.message || error);
            if (error instanceof InternalServerErrorException) {
                throw error;
            }
            throw new InternalServerErrorException(
                error?.message || 'Erreur de communication avec le moteur RAG.',
            );
        }
    }
}
