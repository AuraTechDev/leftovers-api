import { IEmailParams } from './email-params.interface';

export interface IEmailSender {
  sendEmail(params: IEmailParams): Promise<void>;
}
