import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SiteService } from './site.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';

@Controller('sites')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.siteService.findAll(user.company_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.siteService.findOne(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateSiteDto, @CurrentUser() user: any) {
    return this.siteService.create(dto, user.company_id);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateSiteDto) {
    return this.siteService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.siteService.remove(id);
  }
}
