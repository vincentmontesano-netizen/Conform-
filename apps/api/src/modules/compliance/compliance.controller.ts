import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('compliance')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post('evaluate')
  evaluate(@CurrentUser() user: any, @Body() body: any) {
    return this.complianceService.evaluate(
      user.company_id,
      body.duerp_id || null,
      body,
    );
  }

  @Get('score')
  getScore(@CurrentUser() user: any) {
    return this.complianceService.getScore(user.company_id);
  }

  @Get('alerts')
  getAlerts(@CurrentUser() user: any) {
    return this.complianceService.getAlerts(user.company_id);
  }

  @Patch('alerts/:id/resolve')
  resolveAlert(@Param('id') id: string, @CurrentUser() user: any) {
    return this.complianceService.resolveAlert(id, user.id);
  }
}
