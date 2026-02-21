import { Module } from '@nestjs/common';
import { EpiController } from './epi.controller';
import { EpiService } from './epi.service';
import { EpiExpiryService } from './epi-expiry.service';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [EpiController],
  providers: [EpiService, EpiExpiryService],
  exports: [EpiService, EpiExpiryService],
})
export class EpiModule {}
