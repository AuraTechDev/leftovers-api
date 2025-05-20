import { Injectable } from '@nestjs/common';
import { IEmailSender } from '../../domain/interfaces/email-sender.interface';
import { env } from '../../../../config/env.config';

/**
 * Options for sending an email via Resend.
 * Extend as needed (attachments, cc, bcc, etc.)
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
  private readonly apiUrl = env.RESEND_API_URL;

  async sendEmail(options: ResendEmailOptions): Promise<void> {
    const payload: any = {
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      from: options.from || 'noreply@yourdomain.com', // Set a default sender if needed
      // cc: options.cc,
      // bcc: options.bcc,
      // attachments: options.attachments,
    };

    // Remove undefined fields
    Object.keys(payload).forEach(
      (key) => payload[key] === undefined && delete payload[key]
    );

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }
  }
} 