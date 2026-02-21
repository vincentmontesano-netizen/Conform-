import { Module } from '@nestjs/common';
import { DuerpTriggerController } from './duerp-trigger.controller';
import { DuerpTriggerService } from './duerp-trigger.service';

@Module({
  controllers: [DuerpTriggerController],
  providers: [DuerpTriggerService],
  exports: [DuerpTriggerService],
})
export class DuerpTriggerModule {}
