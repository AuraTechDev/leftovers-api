import { Provider, Role } from '@prisma/client';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: Role;
  photoUrl?: string;
  provider: Provider;
}
