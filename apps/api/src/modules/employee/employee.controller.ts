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
import { EmployeeService } from './employee.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/create-employee.dto';

@Controller('employees')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('site_id') siteId?: string,
    @Query('is_active') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.employeeService.findAll(user.company_id, {
      search,
      site_id: siteId,
      is_active: isActive !== undefined ? isActive === 'true' : undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('search')
  search(
    @CurrentUser() user: any,
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    return this.employeeService.search(
      user.company_id,
      query || '',
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.employeeService.getStats(user.company_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findOneWithRelations(id);
  }

  @Post()
  @Roles('admin', 'rh', 'manager')
  create(@Body() dto: CreateEmployeeDto, @CurrentUser() user: any) {
    return this.employeeService.create(dto, user);
  }

  @Post('import')
  @Roles('admin', 'rh')
  importFromRup(@CurrentUser() user: any) {
    return this.employeeService.importFromRup(user.company_id, user);
  }

  @Patch(':id')
  @Roles('admin', 'rh', 'manager')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeeService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'rh')
  remove(@Param('id') id: string) {
    return this.employeeService.softDelete(id);
  }
}
