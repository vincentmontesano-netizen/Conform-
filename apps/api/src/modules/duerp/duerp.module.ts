import { Module } from '@nestjs/common';
import { DuerpController } from './duerp.controller';
import { DuerpExportController } from './duerp-export.controller';
import { DuerpService } from './duerp.service';

@Module({
  controllers: [DuerpController, DuerpExportController],
  providers: [DuerpService],
  exports: [DuerpService],
})
export class DuerpModule {}
