import { Controller, Get, Patch, Param, Query, Body } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    /** GET /admin/metrics — KPIs globaux de la plateforme */
    @Get('metrics')
    getMetrics() {
        return this.adminService.getGlobalMetrics();
    }

    /** GET /admin/companies — toutes les companies + subscription */
    @Get('companies')
    getCompanies() {
        return this.adminService.getAllCompaniesWithSubscriptions();
    }

    /** GET /admin/users — tous les profils + company */
    @Get('users')
    getUsers() {
        return this.adminService.getAllUsersWithCompany();
    }

    /** GET /admin/audit-logs — journal cross-tenant */
    @Get('audit-logs')
    getAuditLogs(
        @Query('company_id') companyId?: string,
        @Query('action') action?: string,
    ) {
        return this.adminService.getAuditLogs(companyId, action);
    }

    /** PATCH /admin/users/:id/role — changer le rôle d'un utilisateur */
    @Patch('users/:id/role')
    updateUserRole(
        @Param('id') profileId: string,
        @Body() body: { role: string },
    ) {
        return this.adminService.updateUserRole(profileId, body.role);
    }

    /** PATCH /admin/subscriptions/:companyId — upgrade/downgrade plan */
    @Patch('subscriptions/:companyId')
    updateSubscription(
        @Param('companyId') companyId: string,
        @Body() body: { plan: string; status: string },
    ) {
        return this.adminService.updateSubscription(companyId, body.plan, body.status);
    }

    /** GET /admin/settings — Récupérer tous les paramètres globaux */
    @Get('settings')
    getSettings() {
        return this.adminService.getSettings();
    }

    /** PATCH /admin/settings/:key — Mettre à jour un paramètre global */
    @Patch('settings/:key')
    updateSetting(
        @Param('key') key: string,
        @Body() body: { value: any; description?: string },
    ) {
        return this.adminService.updateSetting(key, body.value, body.description);
    }
}
