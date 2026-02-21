import { Module } from '@nestjs/common';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';
import { ConfigModule } from '../../config/config.module';

@Module({
    imports: [ConfigModule],
    controllers: [KnowledgeController],
    providers: [KnowledgeService],
    exports: [KnowledgeService],
})
export class KnowledgeModule { }
