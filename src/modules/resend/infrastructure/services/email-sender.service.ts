import { Injectable } from '@nestjs/common';
import { IEmailSender } from '../../domain/interfaces/email-sender.interface';
import { IEmailParams } from '../../domain/interfaces/email-params.interface';
import { ResendService } from './resend.service';

@Injectable()
export class EmailSenderService implements IEmailSender {
  constructor(private readonly resendService: ResendService) {}

  async sendEmail(params: IEmailParams): Promise<void> {
    await this.resendService.sendEmail({
      ...params,
      text: params.text ?? '', // Ensure text is always a string
    });
  }
}
