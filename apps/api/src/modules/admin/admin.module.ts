import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SubscriptionModule } from '../subscription/subscription.module';
import { ConfigModule } from '../../config/config.module';

@Module({
    imports: [ConfigModule, SubscriptionModule],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }
