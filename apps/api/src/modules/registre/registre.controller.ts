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
import { RegistreService } from './registre.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateRegistreDto, UpdateRegistreDto } from './dto/create-registre.dto';
import { CreateRegistreEntryDto, UpdateRegistreEntryDto } from './dto/create-registre-entry.dto';

@Controller('registres')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class RegistreController {
  constructor(private readonly registreService: RegistreService) {}

  // ─── Registres ─────────────────────────────────────

  @Get()
  findAll(@CurrentUser() user: any, @Query('type') type?: string) {
    if (!user?.company_id) return [];
    return this.registreService.findAll(user.company_id, type);
  }

  @Get('expiring')
  getExpiring(@CurrentUser() user: any, @Query('days') days?: string) {
    if (!user?.company_id) return [];
    return this.registreService.getExpiringEntries(user.company_id, days ? parseInt(days, 10) : 30);
  }

  @Post()
  @Roles('admin', 'rh', 'manager')
  create(@Body() dto: CreateRegistreDto, @CurrentUser() user: any) {
    return this.registreService.create(dto, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registreService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'rh', 'manager')
  update(@Param('id') id: string, @Body() dto: UpdateRegistreDto) {
    return this.registreService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.registreService.delete(id);
  }

  // ─── Entries ───────────────────────────────────────

  @Get(':id/entries')
  findEntries(
    @Param('id') registreId: string,
    @Query('archived') archived?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.registreService.findEntries(registreId, {
      archived: archived !== undefined ? archived === 'true' : undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post(':id/entries')
  @Roles('admin', 'rh', 'manager')
  createEntry(
    @Param('id') registreId: string,
    @Body() dto: CreateRegistreEntryDto,
    @CurrentUser() user: any,
  ) {
    return this.registreService.createEntry(registreId, dto, user);
  }

  @Patch(':id/entries/:entryId')
  @Roles('admin', 'rh', 'manager')
  updateEntry(
    @Param('id') registreId: string,
    @Param('entryId') entryId: string,
    @Body() dto: UpdateRegistreEntryDto,
  ) {
    return this.registreService.updateEntry(registreId, entryId, dto);
  }

  @Delete(':id/entries/:entryId')
  @Roles('admin', 'rh')
  archiveEntry(@Param('id') registreId: string, @Param('entryId') entryId: string) {
    return this.registreService.archiveEntry(registreId, entryId);
  }

  // ─── Documents ─────────────────────────────────────

  @Post(':id/entries/:entryId/documents')
  @Roles('admin', 'rh', 'manager')
  @UseInterceptors(FileInterceptor('file'))
  addDocument(
    @Param('entryId') entryId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    return this.registreService.addDocument(entryId, file, user);
  }

  @Delete(':id/entries/:entryId/documents/:docId')
  @Roles('admin', 'rh')
  removeDocument(@Param('docId') docId: string) {
    return this.registreService.removeDocument(docId);
  }

  // ─── Export ────────────────────────────────────────

  @Get(':id/export')
  exportRegistre(@Param('id') id: string) {
    return this.registreService.exportRegistre(id);
  }
}
