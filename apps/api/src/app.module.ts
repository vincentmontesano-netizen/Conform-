import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { SiteModule } from './modules/site/site.module';
import { ProfileModule } from './modules/profile/profile.module';
import { DuerpModule } from './modules/duerp/duerp.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DuerpTriggerModule } from './modules/duerp-trigger/duerp-trigger.module';
import { UploadModule } from './modules/upload/upload.module';
import { RegistreModule } from './modules/registre/registre.module';
import { EpiModule } from './modules/epi/epi.module';
import { FormationModule } from './modules/formation/formation.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { AdminModule } from './modules/admin/admin.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { InspectionModule } from './modules/inspection/inspection.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    CompanyModule,
    SiteModule,
    ProfileModule,
    DuerpModule,
    DuerpTriggerModule,
    UploadModule,
    AuditLogModule,
    ComplianceModule,
    DashboardModule,
    RegistreModule,
    EpiModule,
    FormationModule,
    SubscriptionModule,
    AdminModule,
    KnowledgeModule,
    ChatbotModule,
    EmployeeModule,
    InspectionModule,
  ],
})
export class AppModule { }
