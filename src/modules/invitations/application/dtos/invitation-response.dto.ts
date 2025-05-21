import { BusinessInvitation } from '../../domain/entities/business-invitation.entity';

export class InvitationResponseDto {
  isValid: boolean;
  isExpired: boolean;
  businessName?: string;
  email?: string;

  static fromEntity(
    invitation: BusinessInvitation | null,
    businessName?: string,
  ): InvitationResponseDto {
    if (!invitation) {
      return {
        isValid: false,
        isExpired: false,
      };
    }

    return {
      isValid: invitation.isPending(),
      isExpired: invitation.isExpired(),
      businessName,
      email: invitation.email,
    };
  }
}
