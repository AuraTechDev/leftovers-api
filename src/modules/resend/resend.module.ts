import { Module } from '@nestjs/common';
import { ResendService } from './infrastructure/services/resend.service';

@Module({
  providers: [
    {
      provide: 'IEmailSender',
      useClass: ResendService,
    },
  ],
  exports: ['IEmailSender'],
})
export class ResendModule {}
