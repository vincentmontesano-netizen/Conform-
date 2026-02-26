import { Controller, Get, Post, Body, InternalServerErrorException } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
    constructor(private readonly chatbotService: ChatbotService) { }

    /** Vérifie que Mistral est configuré (clé + agent) */
    @Get('health')
    health() {
        return this.chatbotService.checkConfig();
    }

    @Post('message')
    async sendMessage(@Body() body: { messages: { role: string; content: string }[] }) {
        if (!body.messages || !Array.isArray(body.messages)) {
            throw new InternalServerErrorException('Format de messages invalide.');
        }

        return await this.chatbotService.processMessage(body.messages);
    }
}
