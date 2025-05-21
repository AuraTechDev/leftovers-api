import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InvitationsRepository } from '../../infrastructure/repositories/invitations.repository';
import { SendInvitationDto } from '../../infrastructure/dto/send-invitation.dto';
import { BusinessInvitation } from '../../domain/entities/business-invitation.entity';
import { EmailService } from '../../infrastructure/services/email.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { randomBytes } from 'crypto';
import { BusinessInvitationStatus, Role } from '@prisma/client';

@Injectable()
export class SendInvitationUseCase {
  constructor(
    private readonly invitationsRepository: InvitationsRepository,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    sendInvitationDto: SendInvitationDto,
    currentUserId: number,
  ): Promise<BusinessInvitation> {
    // Verify that the current user is a SUPER_ADMIN
    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId },
    });

    if (!currentUser || currentUser.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Only SUPER_ADMIN can send business invitations',
      );
    }

    // Verify that the business exists
    const business = await this.prisma.business.findUnique({
      where: { id: sendInvitationDto.businessId },
    });

    if (!business) {
      throw new NotFoundException(
        `Business with ID ${sendInvitationDto.businessId} not found`,
      );
    }

    // Check if user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: sendInvitationDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Rate limiting: Check how many invitations have been sent to this email in the last 24 hours
    const recentInvitations =
      await this.invitationsRepository.countRecentInvitationsByEmail(
        sendInvitationDto.email,
      );

    const MAX_INVITATIONS_PER_DAY = 3;
    if (recentInvitations >= MAX_INVITATIONS_PER_DAY) {
      throw new BadRequestException(
        `Too many invitations sent to this email. Maximum ${MAX_INVITATIONS_PER_DAY} invitations per day allowed.`,
      );
    }

    // Check if there's already a pending invitation for this email/business
    const existingInvitation =
      await this.invitationsRepository.findByEmailAndBusinessId(
        sendInvitationDto.email,
        sendInvitationDto.businessId,
      );

    // Set expiration to 3 days from now (changed from 7)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    // If there's an existing invitation that's expired or already used, invalidate it first
    if (existingInvitation) {
      await this.invitationsRepository.update(existingInvitation.id, {
        status: BusinessInvitationStatus.EXPIRED,
        updatedAt: new Date(),
      });
    }

    // Generate a secure token
    const token = randomBytes(32).toString('hex');

    // Create invitation
    const invitation = new BusinessInvitation({
      email: sendInvitationDto.email,
      businessId: sendInvitationDto.businessId,
      token,
      status: BusinessInvitationStatus.PENDING,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdInvitation =
      await this.invitationsRepository.create(invitation);

    // Send email
    await this.emailService.sendInvitationEmail(
      createdInvitation,
      business.name,
    );

    return createdInvitation;
  }
}
