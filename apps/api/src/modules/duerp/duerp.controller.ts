import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DuerpService } from './duerp.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('duerps')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class DuerpController {
  constructor(private readonly duerpService: DuerpService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.duerpService.findAll(user.company_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.duerpService.findOne(id);
  }

  @Post()
  create(@Body() dto: any, @CurrentUser() user: any) {
    return this.duerpService.create(dto, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.duerpService.update(id, dto);
  }

  @Post(':id/validate')
  validate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.duerpService.validate(id, user);
  }

  @Get(':id/versions')
  getVersions(@Param('id') id: string) {
    return this.duerpService.getVersions(id);
  }

  @Post(':id/work-units')
  addWorkUnit(@Param('id') id: string, @Body() dto: any) {
    return this.duerpService.addWorkUnit(id, dto);
  }

  @Post(':id/work-units/:unitId/risks')
  addRisk(
    @Param('id') id: string,
    @Param('unitId') unitId: string,
    @Body() dto: any,
  ) {
    return this.duerpService.addRisk(id, unitId, dto);
  }

  @Post(':id/action-plans')
  addActionPlan(@Param('id') id: string, @Body() dto: any) {
    return this.duerpService.addActionPlan(id, dto);
  }

  @Patch(':id/action-plans/:planId')
  updateActionPlan(
    @Param('id') id: string,
    @Param('planId') planId: string,
    @Body() dto: any,
  ) {
    return this.duerpService.updateActionPlan(id, planId, dto);
  }
}
