import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InvitationsRepository } from '../../infrastructure/repositories/invitations.repository';
import { AcceptInvitationDto } from '../../infrastructure/dto/accept-invitation.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { Provider, Role } from '@prisma/client';
import { BusinessInvitationStatus } from '@prisma/client';

@Injectable()
export class AcceptInvitationUseCase {
  constructor(
    private readonly invitationsRepository: InvitationsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(acceptInvitationDto: AcceptInvitationDto) {
    // Find invitation by token
    const invitation = await this.invitationsRepository.findByToken(
      acceptInvitationDto.token,
    );

    if (!invitation) {
      throw new BadRequestException('Invalid invitation token');
    }

    // Check if invitation is expired or not pending
    if (!invitation.canBeAccepted()) {
      if (invitation.isExpired()) {
        throw new BadRequestException('Invitation has expired');
      } else {
        throw new BadRequestException('Invitation has already been used');
      }
    }

    // Check if email is already in use by another user
    const existingUser = await this.prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    // Create user with BUSINESS role
    const hashedPassword = await bcrypt.hash(acceptInvitationDto.password, 10);

    // Use a transaction to ensure both operations succeed or fail together
    const result = await this.prisma.$transaction(async (tx) => {
      // Create the new user with BUSINESS role
      const user = await tx.user.create({
        data: {
          email: invitation.email,
          name: acceptInvitationDto.name,
          password: hashedPassword,
          role: Role.BUSINESS,
          provider: Provider.LOCAL,
          businessId: invitation.businessId,
        },
      });

      // Update invitation status to ACCEPTED
      const updatedInvitation = await tx.businessInvitation.update({
        where: { id: invitation.id },
        data: {
          status: BusinessInvitationStatus.ACCEPTED,
          updatedAt: new Date(),
        },
      });

      return { user, updatedInvitation };
    });

    return {
      message: 'Invitation accepted successfully',
      userId: result.user.id,
    };
  }
}
