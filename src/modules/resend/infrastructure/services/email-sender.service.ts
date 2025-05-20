import { Injectable } from '@nestjs/common';
import { IEmailSender } from '../../domain/interfaces/email-sender.interface';
import { ResendService } from './resend.service';
import { env } from '../../../../config/env.config';

@Injectable()
export class EmailSenderService implements IEmailSender {
  constructor(private readonly resendService: ResendService) {}

  async sendEmail(params: {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    text?: string;
    replyTo?: string;
    cc?: string[];
    bcc?: string[];
  }): Promise<void> {
    const defaultFrom = env.RESEND_FROM_EMAIL || 'no-reply@leftovers.app';

    await this.resendService.sendEmail({
      ...params,
      from: params.from || defaultFrom,
      text: params.text ?? '', // Ensure text is always a string
    });
  }
}
