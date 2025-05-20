import { Module } from '@nestjs/common';
import { ResendService } from './infrastructure/services/resend.service';

@Module({
  providers: [
    ResendService,
    {
      provide: 'IEmailSender',
      useExisting: ResendService,
    },
  ],
  exports: ['IEmailSender'],
})
export class ResendModule {} 