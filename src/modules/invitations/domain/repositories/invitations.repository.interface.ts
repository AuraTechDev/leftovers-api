import { BusinessInvitation } from '../entities/business-invitation.entity';

export interface IInvitationsRepository {
  create(invitation: BusinessInvitation): Promise<BusinessInvitation>;
  findByToken(token: string): Promise<BusinessInvitation | null>;
  findByEmailAndBusinessId(
    email: string,
    businessId: number,
  ): Promise<BusinessInvitation | null>;
  update(
    id: number,
    invitation: Partial<BusinessInvitation>,
  ): Promise<BusinessInvitation>;
  delete(id: number): Promise<void>;
  findPendingByBusinessId(businessId: number): Promise<BusinessInvitation[]>;
}
