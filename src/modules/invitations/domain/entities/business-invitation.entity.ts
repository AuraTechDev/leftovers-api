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

  /**
   * Validates if the token matches and has not been tampered with
   * Uses timing-safe comparison to prevent timing attacks
   */
  validateToken(providedToken: string): boolean {
    if (!providedToken || !this.token) {
      return false;
    }

    // Simple constant-time string comparison to prevent timing attacks
    // In a real production app, use a proper constant-time comparison library
    if (providedToken.length !== this.token.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < providedToken.length; i++) {
      result |= providedToken.charCodeAt(i) ^ this.token.charCodeAt(i);
    }

    return result === 0;
  }
}
