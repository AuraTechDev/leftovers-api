import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import * as bcrypt from 'bcryptjs';
import { Provider } from '@prisma/client';
import { AuthUser } from '../../domain/interfaces/user.interface';

@Injectable()
export class ValidateUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(email: string, password: string): Promise<AuthUser | null> {
    const user = await this.authRepository.findUserByEmail(email);

    if (!user || user.provider !== Provider.LOCAL || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      photoUrl: user.photoUrl || undefined,
      provider: user.provider,
      businessId: user.businessId || undefined,
    };
  }
}
