import { BusinessInvitationStatus } from '@prisma/client';

export class BusinessInvitation {
  id: number;
  email: string;
  businessId: number;
  token: string;
  status: BusinessInvitationStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<BusinessInvitation>) {
    Object.assign(this, partial);
  }

  isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  isPending(): boolean {
    return this.status === BusinessInvitationStatus.PENDING;
  }

  canBeAccepted(): boolean {
    return this.isPending() && !this.isExpired();
  }

  markAsAccepted(): void {
    this.status = BusinessInvitationStatus.ACCEPTED;
    this.updatedAt = new Date();
  }

  markAsExpired(): void {
    this.status = BusinessInvitationStatus.EXPIRED;
    this.updatedAt = new Date();
  }
}
