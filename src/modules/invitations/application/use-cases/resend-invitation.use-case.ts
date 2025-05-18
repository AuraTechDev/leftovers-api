import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InvitationsRepository } from '../../infrastructure/repositories/invitations.repository';
import { EmailService } from '../../infrastructure/services/email.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { randomBytes } from 'crypto';
import { Role } from '@prisma/client';

@Injectable()
export class ResendInvitationUseCase {
  constructor(
    private readonly invitationsRepository: InvitationsRepository,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(invitationId: number, currentUserId: number): Promise<void> {
    // Verify that the current user is a SUPER_ADMIN
    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId },
    });

    if (!currentUser || currentUser.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Only SUPER_ADMIN can resend business invitations',
      );
    }

    // Find invitation
    const invitation = await this.prisma.businessInvitation.findUnique({
      where: { id: invitationId },
      include: { business: true },
    });

    if (!invitation) {
      throw new NotFoundException(
        `Invitation with ID ${invitationId} not found`,
      );
    }

    // Check if the invitation is in a state that can be resent
    if (invitation.status !== 'PENDING') {
      throw new BadRequestException('Only pending invitations can be resent');
    }

    // Generate a new token and update expiration date
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Update invitation
    await this.prisma.businessInvitation.update({
      where: { id: invitationId },
      data: {
        token,
        expiresAt,
        updatedAt: new Date(),
      },
    });

    // Reload invitation with the new token
    const updatedInvitation =
      await this.invitationsRepository.findByToken(token);

    if (!updatedInvitation) {
      throw new BadRequestException('Failed to update invitation');
    }

    // Send email
    await this.emailService.sendInvitationEmail(
      updatedInvitation,
      invitation.business.name,
    );
  }
}
