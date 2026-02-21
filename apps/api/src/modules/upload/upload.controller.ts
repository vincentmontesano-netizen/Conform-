import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('uploads')
@UseGuards(SupabaseAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('proof')
  @UseInterceptors(FileInterceptor('file'))
  uploadProof(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    return this.uploadService.uploadProof(file, user.id);
  }

  @Delete('proof/:filename')
  deleteProof(@Param('filename') filename: string) {
    return this.uploadService.deleteProof(filename);
  }
}
