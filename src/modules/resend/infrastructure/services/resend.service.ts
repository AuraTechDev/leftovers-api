import { Injectable } from '@nestjs/common';
import { IEmailSender } from '../../domain/interfaces/email-sender.interface';
import { env } from '../../../../config/env.config';

/**
 * Options for sending an email via Resend.
 * You can extend this interface as needed (attachments, cc, bcc, etc.)
 */
export interface ResendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  // cc?: string[];
  // bcc?: string[];
  // attachments?: any[];
}

@Injectable()
export class ResendService implements IEmailSender {
  private readonly apiKey = env.RESEND_API_KEY;

  async sendEmail(options: ResendEmailOptions): Promise<void> {
    // TODO: Integrate with Resend API using this.apiKey
    // Example using fetch/axios/SDK:
    // await resend.emails.send({ ...options, apiKey: this.apiKey });
    console.log('Sending email via Resend:', options);
    // throw new Error('Not implemented: integrate with Resend API');
  }
} 