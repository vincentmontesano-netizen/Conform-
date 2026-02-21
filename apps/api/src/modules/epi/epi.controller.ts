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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EpiService } from './epi.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateEpiCategoryDto, UpdateEpiCategoryDto } from './dto/create-epi-category.dto';
import { CreateEpiItemDto, UpdateEpiItemDto } from './dto/create-epi-item.dto';
import { CreateEpiAttributionDto, UpdateEpiAttributionDto } from './dto/create-epi-attribution.dto';
import { CreateEpiControleDto } from './dto/create-epi-controle.dto';

@Controller('epi')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class EpiController {
  constructor(private readonly epiService: EpiService) {}

  // ─── Categories ─────────────────────────────────────

  @Get('categories')
  findAllCategories(@CurrentUser() user: any) {
    return this.epiService.findAllCategories(user.company_id);
  }

  @Post('categories/init')
  @Roles('admin', 'rh')
  initCategories(@CurrentUser() user: any) {
    return this.epiService.initFromPresets(user);
  }

  @Post('categories')
  @Roles('admin', 'rh', 'manager')
  createCategory(@Body() dto: CreateEpiCategoryDto, @CurrentUser() user: any) {
    return this.epiService.createCategory(dto, user);
  }

  @Get('categories/:id')
  findOneCategory(@Param('id') id: string) {
    return this.epiService.findOneCategory(id);
  }

  @Patch('categories/:id')
  @Roles('admin', 'rh', 'manager')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateEpiCategoryDto) {
    return this.epiService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @Roles('admin')
  deleteCategory(@Param('id') id: string) {
    return this.epiService.deleteCategory(id);
  }

  // ─── Items ──────────────────────────────────────────

  @Get('items')
  findAllItems(
    @CurrentUser() user: any,
    @Query('statut') statut?: string,
    @Query('etat') etat?: string,
    @Query('category_id') categoryId?: string,
    @Query('site_id') siteId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.epiService.findAllItems(user.company_id, {
      statut,
      etat,
      category_id: categoryId,
      site_id: siteId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('items/expiring')
  getExpiringItems(@CurrentUser() user: any, @Query('days') days?: string) {
    return this.epiService.getExpiringItems(user.company_id, days ? parseInt(days, 10) : 30);
  }

  @Post('items')
  @Roles('admin', 'rh', 'manager')
  createItem(@Body() dto: CreateEpiItemDto, @CurrentUser() user: any) {
    return this.epiService.createItem(dto, user);
  }

  @Get('items/:id')
  findOneItem(@Param('id') id: string) {
    return this.epiService.findOneItem(id);
  }

  @Get('items/:id/attestation')
  getAttestation(@Param('id') id: string) {
    return this.epiService.getAttestationData(id);
  }

  @Patch('items/:id')
  @Roles('admin', 'rh', 'manager')
  updateItem(@Param('id') id: string, @Body() dto: UpdateEpiItemDto) {
    return this.epiService.updateItem(id, dto);
  }

  @Delete('items/:id')
  @Roles('admin')
  deleteItem(@Param('id') id: string) {
    return this.epiService.deleteItem(id);
  }

  // ─── Attributions ───────────────────────────────────

  @Get('attributions')
  findAllAttributions(
    @CurrentUser() user: any,
    @Query('salarie_nom') salarieNom?: string,
    @Query('epi_item_id') epiItemId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.epiService.findAllAttributions(user.company_id, {
      salarie_nom: salarieNom,
      epi_item_id: epiItemId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post('attributions')
  @Roles('admin', 'rh', 'manager')
  createAttribution(@Body() dto: CreateEpiAttributionDto, @CurrentUser() user: any) {
    return this.epiService.createAttribution(dto, user);
  }

  @Get('attributions/:id')
  findOneAttribution(@Param('id') id: string) {
    return this.epiService.findOneAttribution(id);
  }

  @Patch('attributions/:id')
  @Roles('admin', 'rh', 'manager')
  updateAttribution(@Param('id') id: string, @Body() dto: UpdateEpiAttributionDto) {
    return this.epiService.updateAttribution(id, dto);
  }

  // ─── Controles ──────────────────────────────────────

  @Get('controles')
  findAllControles(
    @CurrentUser() user: any,
    @Query('epi_item_id') epiItemId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.epiService.findAllControles(user.company_id, {
      epi_item_id: epiItemId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post('controles')
  @Roles('admin', 'rh', 'manager')
  createControle(@Body() dto: CreateEpiControleDto, @CurrentUser() user: any) {
    return this.epiService.createControle(dto, user);
  }

  // ─── Documents ──────────────────────────────────────

  @Post('documents')
  @Roles('admin', 'rh', 'manager')
  @UseInterceptors(FileInterceptor('file'))
  addDocument(
    @Query('parent_type') parentType: 'item' | 'attribution' | 'controle',
    @Query('parent_id') parentId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    return this.epiService.addDocument(parentType, parentId, file, user);
  }

  @Delete('documents/:id')
  @Roles('admin', 'rh')
  removeDocument(@Param('id') id: string) {
    return this.epiService.removeDocument(id);
  }

  // ─── Stats ──────────────────────────────────────────

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.epiService.getStats(user.company_id);
  }
}
