import { Module } from '@nestjs/common';
import { ResendService } from './infrastructure/services/resend.service';
import { EmailSenderService } from './infrastructure/services/email-sender.service';

@Module({
  providers: [
    ResendService,
    {
      provide: 'IEmailSender',
      useClass: EmailSenderService,
    },
  ],
  exports: ['IEmailSender'],
})
export class ResendModule {}
