import { Module } from '@nestjs/common';
import { DuerpController } from './duerp.controller';
import { DuerpService } from './duerp.service';

@Module({
  controllers: [DuerpController],
  providers: [DuerpService],
  exports: [DuerpService],
})
export class DuerpModule {}
