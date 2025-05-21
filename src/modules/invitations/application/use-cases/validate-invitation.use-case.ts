import { Injectable } from '@nestjs/common';
import { InvitationsRepository } from '../../infrastructure/repositories/invitations.repository';
import { InvitationResponseDto } from '../dtos/invitation-response.dto';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ValidateInvitationUseCase {
  constructor(
    private readonly invitationsRepository: InvitationsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(token: string): Promise<InvitationResponseDto> {
    const invitation = await this.invitationsRepository.findByToken(token);

    if (!invitation) {
      return InvitationResponseDto.fromEntity(null);
    }

    const business = await this.prisma.business.findUnique({
      where: { id: invitation.businessId },
    });

    const businessName = business ? business.name : undefined;

    return InvitationResponseDto.fromEntity(invitation, businessName);
  }
}
