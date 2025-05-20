export interface IEmailSender {
  sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from?: string;
  }): Promise<void>;
} 