import { Role, Provider } from '@prisma/client';

export class User {
  id: number;
  email: string;
  name: string;
  password?: string;
  photoUrl?: string;
  role: Role;
  provider: Provider;
  providerId?: string;
  businessId?: number | null; // ID of the business it is associated with (for users with the BUSINESS role)
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<User>) {
    Object.assign(this, data);
  }
}
