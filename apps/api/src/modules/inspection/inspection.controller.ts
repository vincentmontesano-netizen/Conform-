import { Controller, Get, UseGuards } from '@nestjs/common';
import { InspectionService } from './inspection.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('inspection')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class InspectionController {
  constructor(private readonly inspectionService: InspectionService) {}

  @Get('readiness')
  getReadiness(@CurrentUser() user: any) {
    return this.inspectionService.getReadiness(user.company_id);
  }
}
