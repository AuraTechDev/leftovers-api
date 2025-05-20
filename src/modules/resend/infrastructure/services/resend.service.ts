import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { env } from '../../../../config/env.config';

@Injectable()
export class ResendService {
  private readonly resend: Resend;

  constructor() {
    this.resend = new Resend(env.RESEND_API_KEY);
  }

  async sendEmail(params: {
    from: string;
    to: string | string[];
    subject: string;
    text: string;
    html?: string;
    replyTo?: string;
    cc?: string[];
    bcc?: string[];
  }) {
    return this.resend.emails.send(params);
  }
}
