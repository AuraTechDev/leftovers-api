import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BusinessInvitation } from '../../domain/entities/business-invitation.entity';
import { IInvitationsRepository } from '../../domain/repositories/invitations.repository.interface';
import { BusinessInvitationStatus } from '@prisma/client';

@Injectable()
export class InvitationsRepository implements IInvitationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(invitation: BusinessInvitation): Promise<BusinessInvitation> {
    const { email, businessId, token, status, expiresAt } = invitation;

    const createdInvitation = await this.prisma.businessInvitation.create({
      data: {
        email,
        businessId,
        token,
        status,
        expiresAt,
      },
    });

    return this.mapToEntity(createdInvitation);
  }

  async findByToken(token: string): Promise<BusinessInvitation | null> {
    const invitation = await this.prisma.businessInvitation.findUnique({
      where: { token },
      include: { business: true },
    });

    if (!invitation) return null;

    return this.mapToEntity(invitation);
  }

  async findByEmailAndBusinessId(
    email: string,
    businessId: number,
  ): Promise<BusinessInvitation | null> {
    const invitation = await this.prisma.businessInvitation.findFirst({
      where: {
        email,
        businessId,
        status: BusinessInvitationStatus.PENDING,
      },
    });

    if (!invitation) return null;

    return this.mapToEntity(invitation);
  }

  async update(
    id: number,
    invitation: Partial<BusinessInvitation>,
  ): Promise<BusinessInvitation> {
    const updatedInvitation = await this.prisma.businessInvitation.update({
      where: { id },
      data: {
        ...invitation,
      },
    });

    return this.mapToEntity(updatedInvitation);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.businessInvitation.delete({
      where: { id },
    });
  }

  async findPendingByBusinessId(
    businessId: number,
  ): Promise<BusinessInvitation[]> {
    const invitations = await this.prisma.businessInvitation.findMany({
      where: {
        businessId,
        status: BusinessInvitationStatus.PENDING,
      },
    });

    return invitations.map((invitation) => this.mapToEntity(invitation));
  }

  async countRecentInvitationsByEmail(
    email: string,
    hours: number = 24,
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    const count = await this.prisma.businessInvitation.count({
      where: {
        email,
        createdAt: {
          gte: cutoffDate,
        },
      },
    });

    return count;
  }

  async markExpiredInvitations(): Promise<number> {
    const now = new Date();

    const result = await this.prisma.businessInvitation.updateMany({
      where: {
        expiresAt: {
          lt: now,
        },
        status: BusinessInvitationStatus.PENDING,
      },
      data: {
        status: BusinessInvitationStatus.EXPIRED,
      },
    });

    return result.count;
  }

  private mapToEntity(data: {
    id: number;
    email: string;
    businessId: number;
    token: string;
    status: BusinessInvitationStatus;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    business?: any;
  }): BusinessInvitation {
    return new BusinessInvitation({
      id: data.id,
      email: data.email,
      businessId: data.businessId,
      token: data.token,
      status: data.status,
      expiresAt: data.expiresAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
