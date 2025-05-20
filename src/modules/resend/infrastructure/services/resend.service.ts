import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { IEmailParams } from '../../domain/interfaces/email-params.interface';
import { env } from '../../../../config/env.config';

@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);
  private readonly resend: Resend;

  constructor() {
    this.resend = new Resend(env.RESEND_API_KEY);
  }

  async sendEmail(params: IEmailParams) {
    const defaultFrom = env.RESEND_FROM_EMAIL || 'no-reply@leftovers.app';

    try {
      return this.resend.emails.send({
        from: params.from || defaultFrom,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        replyTo: params.replyTo,
        cc: params.cc,
        bcc: params.bcc,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email to: ${Array.isArray(params.to) ? params.to.join(', ') : params.to}, Subject: ${params.subject}. Error: ${error}`,
      );
    }
  }
}
