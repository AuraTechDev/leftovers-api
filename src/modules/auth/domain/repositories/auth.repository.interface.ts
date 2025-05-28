import { User } from '../../../users/domain/entities/user.entity';
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
}
