import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DuerpTriggerService } from './duerp-trigger.service';
import { CreateDuerpTriggerDto } from './dto/create-duerp-trigger.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('duerp-triggers')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class DuerpTriggerController {
  constructor(private readonly service: DuerpTriggerService) {}

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('resolved') resolved?: string,
  ) {
    const resolvedFilter = resolved === 'true' ? true : resolved === 'false' ? false : undefined;
    return this.service.findAll(user.company_id, resolvedFilter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDuerpTriggerDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Patch(':id/resolve')
  resolve(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { duerp_version_id?: string },
  ) {
    return this.service.resolve(id, user.id, body?.duerp_version_id);
  }
}
