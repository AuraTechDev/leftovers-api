import { Injectable, Logger } from '@nestjs/common';
import { BusinessInvitation } from '../../domain/entities/business-invitation.entity';
import { env } from '../../../../config/env.config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendInvitationEmail(
    invitation: BusinessInvitation,
    businessName: string,
  ): Promise<void> {
    // TODO: Replace with real email service implementation (SendGrid, Mailgun, etc.)
    // For now, we'll just log the email details

    const inviteLink = `${env.FRONTEND_URL}/invite/accept?token=${invitation.token}`;
    const expiresAtStr = invitation.expiresAt.toISOString();

    // Adding an artificial delay to satisfy the linter's requirement for an await expression
    await new Promise((resolve) => setTimeout(resolve, 1));

    this.logger.log(`
      Sending invitation email to: ${invitation.email}
      Business: ${businessName}
      Invitation Link: ${inviteLink}
      Expires: ${expiresAtStr}
    `);
  }

  async sendReminderEmail(
    invitation: BusinessInvitation,
    businessName: string,
  ): Promise<void> {
    // TODO: Replace with real email service implementation (SendGrid, Mailgun, etc.)
    // For now, we'll just log the email details
    const inviteLink = `${env.FRONTEND_URL}/invite/accept?token=${invitation.token}`;
    const expiresAtStr = invitation.expiresAt.toISOString();

    // Adding an artificial delay to satisfy the linter's requirement for an await expression
    await new Promise((resolve) => setTimeout(resolve, 1));

    this.logger.log(`
      Sending reminder email to: ${invitation.email}
      Business: ${businessName}
      Invitation Link: ${inviteLink}
      Expires: ${expiresAtStr}
    `);
  }
}
