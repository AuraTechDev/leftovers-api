export interface IEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  text?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}
