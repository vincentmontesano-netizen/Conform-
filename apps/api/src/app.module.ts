import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { SiteModule } from './modules/site/site.module';
import { ProfileModule } from './modules/profile/profile.module';
import { DuerpModule } from './modules/duerp/duerp.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    CompanyModule,
    SiteModule,
    ProfileModule,
    DuerpModule,
    AuditLogModule,
    ComplianceModule,
    DashboardModule,
  ],
})
export class AppModule {}
