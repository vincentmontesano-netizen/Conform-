import { Module } from '@nestjs/common';
import { RegistreController } from './registre.controller';
import { RegistreService } from './registre.service';
import { RegistreExpiryService } from './registre-expiry.service';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [RegistreController],
  providers: [RegistreService, RegistreExpiryService],
  exports: [RegistreService, RegistreExpiryService],
})
export class RegistreModule {}
