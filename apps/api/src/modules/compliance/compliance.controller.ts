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

  @Get('score')
  getScore(@CurrentUser() user: any) {
    return this.complianceService.getScore(user.company_id);
  }

  @Get('checks')
  getChecks(@CurrentUser() user: any) {
    return this.complianceService.getChecks(user.company_id);
  }

  @Patch('checks/:id')
  updateCheck(@Param('id') id: string, @Body() dto: any) {
    return this.complianceService.updateCheck(id, dto);
  }
}
