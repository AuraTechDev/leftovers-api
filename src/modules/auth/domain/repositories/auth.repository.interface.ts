import { User } from '@prisma/client';
import { Provider } from '@prisma/client';

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: number): Promise<User | null>;
  findUserByProviderAndProviderId(
    provider: Provider,
    providerId: string,
  ): Promise<User | null>;
  createUser(userData: Partial<User>): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  createRefreshToken(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<void>;
  findRefreshToken(token: string): Promise<{
    token: string;
    userId: number;
    expiresAt: Date;
    user: User;
  } | null>;
  deleteRefreshToken(token: string): Promise<void>;
}
