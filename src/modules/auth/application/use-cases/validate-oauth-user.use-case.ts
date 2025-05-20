import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { OAuthLoginDto } from '../dtos/oauth-login.dto';
import { User } from '../../../users/domain/entities/user.entity';

@Injectable()
export class ValidateOAuthUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(oauthData: OAuthLoginDto): Promise<User> {
    let user = await this.authRepository.findUserByProviderAndProviderId(
      oauthData.provider,
      oauthData.providerId,
    );

    if (!user) {
      user = await this.authRepository.createUser({
        email: oauthData.email,
        name: oauthData.name,
        photoUrl: oauthData.photoUrl,
        provider: oauthData.provider,
        providerId: oauthData.providerId,
        role: Role.USER,
      });
    }

    if (user.name !== oauthData.name || user.photoUrl !== oauthData.photoUrl) {
      user = await this.authRepository.updateUser(user.id, {
        name: oauthData.name,
        photoUrl: oauthData.photoUrl,
      });
    }

    return user;
  }
}
