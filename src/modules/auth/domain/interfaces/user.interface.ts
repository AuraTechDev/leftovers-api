import { Provider, Role } from '@prisma/client';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: Role;
  photoUrl?: string;
  provider: Provider;
  businessId?: string; // ID of the business it belongs to (if it has the BUSINESS role)
}
