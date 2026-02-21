import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FormationService } from './formation.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateFormationTypeDto, UpdateFormationTypeDto } from './dto/formation-type.dto';
import type { ConformiteStatus, ConformiteFilters } from '@conform-plus/shared';

@Controller('formations')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class FormationController {
  constructor(private readonly formationService: FormationService) {}

  // ─── Formation Types ──────────────────────────────

  @Get('types')
  findAllTypes(@CurrentUser() user: any) {
    return this.formationService.findAllTypes(user.company_id);
  }

  @Post('types/init')
  @Roles('admin', 'rh')
  initTypes(@CurrentUser() user: any) {
    return this.formationService.initFromPresets(user);
  }

  @Post('types')
  @Roles('admin', 'rh', 'manager')
  createType(@Body() dto: CreateFormationTypeDto, @CurrentUser() user: any) {
    return this.formationService.createType(dto, user);
  }

  @Get('types/:id')
  findOneType(@Param('id') id: string) {
    return this.formationService.findOneType(id);
  }

  @Patch('types/:id')
  @Roles('admin', 'rh', 'manager')
  updateType(@Param('id') id: string, @Body() dto: UpdateFormationTypeDto) {
    return this.formationService.updateType(id, dto);
  }

  @Delete('types/:id')
  @Roles('admin', 'rh')
  deleteType(@Param('id') id: string) {
    return this.formationService.deleteType(id);
  }

  // ─── Conformite Matrix ────────────────────────────

  @Get('conformite')
  getConformiteMatrix(
    @CurrentUser() user: any,
    @Query('category') category?: 'formation' | 'habilitation',
    @Query('status') status?: ConformiteStatus,
    @Query('site_id') siteId?: string,
    @Query('search') search?: string,
    @Query('obligatoire_only') obligatoireOnly?: string,
  ) {
    const filters: ConformiteFilters = {};
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (siteId) filters.site_id = siteId;
    if (search) filters.search = search;
    if (obligatoireOnly === 'true') filters.obligatoire_only = true;

    return this.formationService.getConformiteMatrix(user.company_id, filters);
  }

  // ─── Stats ────────────────────────────────────────

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.formationService.getFormationStats(user.company_id);
  }

  // ─── Rapport Inspection ───────────────────────────

  @Get('rapport')
  getRapport(@CurrentUser() user: any) {
    return this.formationService.getRapportData(
      user.company_id,
      user.company_name || 'Entreprise',
    );
  }
}
