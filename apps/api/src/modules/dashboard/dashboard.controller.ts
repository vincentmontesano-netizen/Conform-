import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(SupabaseAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getOverview(@CurrentUser() user: any) {
    return this.dashboardService.getOverview(user.company_id);
  }
}
