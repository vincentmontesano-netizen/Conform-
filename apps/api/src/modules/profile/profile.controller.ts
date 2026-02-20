import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('profiles')
@UseGuards(SupabaseAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  getMyProfile(@CurrentUser() user: any) {
    return this.profileService.findByUserId(user.id);
  }

  @Patch('me')
  updateMyProfile(@CurrentUser() user: any, @Body() dto: any) {
    return this.profileService.update(user.id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profileService.findByUserId(id);
  }
}
