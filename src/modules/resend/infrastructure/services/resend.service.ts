import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { IEmailParams } from '../../domain/interfaces/email-params.interface';
import { env } from '../../../../config/env.config';
import { IEmailSender } from '../../domain/interfaces/email-sender.interface';

@Injectable()
export class ResendService implements IEmailSender {
  private readonly logger = new Logger(ResendService.name);
  private readonly resend: Resend;
  private readonly defaultFrom: string;

  constructor() {
    this.resend = new Resend(env.RESEND_API_KEY);
    this.defaultFrom = env.RESEND_FROM_EMAIL || 'no-reply@leftovers.app';
  }

  async sendEmail(params: IEmailParams): Promise<void> {
    try {
      await this.resend.emails.send({
        from: params.from || this.defaultFrom,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text ?? '', // Ensure text is always a string
        replyTo: params.replyTo,
        cc: params.cc,
        bcc: params.bcc,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email to: ${Array.isArray(params.to) ? params.to.join(', ') : params.to}, Subject: ${params.subject}. Error: ${error}`,
      );

      throw error; // Rethrow the error
    }
  }
}
