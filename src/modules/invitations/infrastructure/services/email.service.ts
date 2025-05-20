import { Injectable, Logger } from '@nestjs/common';
import { BusinessInvitation } from '../../domain/entities/business-invitation.entity';
import { env } from '../../../../config/env.config';
import { ResendService } from '../../../resend/infrastructure/services/resend.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly resendService: ResendService) {}

  private async sendTemplatedEmail(params: {
    to: string;
    businessName: string;
    inviteLink: string;
    expiresAtStr: string;
    isReminder?: boolean;
  }) {
    const { to, businessName, inviteLink, expiresAtStr, isReminder } = params;
    const subject = isReminder
      ? `Reminder: Join ${businessName} on Leftovers`
      : `Join ${businessName} on Leftovers`;

    await this.resendService.sendEmail({
      to,
      subject,
      html: `
        <h1>${isReminder ? 'Reminder: ' : ''}Join ${businessName} on Leftovers</h1>
        <p>You have been invited to join ${businessName} on Leftovers.</p>
        <p><a href="${inviteLink}">Click here to accept the invitation</a></p>
        <p>This invitation expires on ${new Date(expiresAtStr).toLocaleDateString()}</p>
      `,
    });

    this.logger
      .log(`${isReminder ? 'Reminder email' : 'Invitation email'} sent to: ${to}
        Business: ${businessName}
        Invitation Link: ${inviteLink}
        Expires: ${expiresAtStr}`);
  }

  async sendInvitationEmail(
    invitation: BusinessInvitation,
    businessName: string,
  ): Promise<void> {
    const inviteLink = `${env.FRONTEND_URL}/invite/accept?token=${invitation.token}`;
    const expiresAtStr = invitation.expiresAt.toISOString();

    await this.sendTemplatedEmail({
      to: invitation.email,
      businessName,
      inviteLink,
      expiresAtStr,
    });
  }

  async sendReminderEmail(
    invitation: BusinessInvitation,
    businessName: string,
  ): Promise<void> {
    const inviteLink = `${env.FRONTEND_URL}/invite/accept?token=${invitation.token}`;
    const expiresAtStr = invitation.expiresAt.toISOString();

    await this.sendTemplatedEmail({
      to: invitation.email,
      businessName,
      inviteLink,
      expiresAtStr,
      isReminder: true,
    });
  }
}
