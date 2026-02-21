import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    Req,
    UseGuards,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';

@Controller('subscriptions')
export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) { }

    /** GET /subscriptions/me — abonnement de la company de l'utilisateur connecté */
    @Get('me')
    async getMySubscription(@Req() req: Request & { companyId: string }) {
        return this.subscriptionService.findByCompany(req.companyId);
    }

    /** PATCH /subscriptions/:companyId — upgrade/downgrade (admin only) */
    @Patch(':companyId')
    async updateSubscription(
        @Param('companyId') companyId: string,
        @Body() body: { plan: string; status: string },
    ) {
        return this.subscriptionService.updatePlan(companyId, body.plan, body.status);
    }
}
