import { Module } from '@nestjs/common';
import { ResendService } from './infrastructure/services/resend.service';

@Module({
  providers: [ResendService],
  exports: [ResendService],
})
export class ResendModule {}
