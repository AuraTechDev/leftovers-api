import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import { env } from '../../../../config/env.config';
import { Provider } from '@prisma/client';
import { OAuthLoginDto } from '../../infrastructure/dto/oauth-login.dto';
import { ValidateOAuthUserUseCase } from '../../application/use-cases';

// Define interface for Apple profile
interface AppleProfile {
  id: string;
  email?: string;
  name?: {
    firstName?: string;
    lastName?: string;
  };
}

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy as any, 'apple') {
  constructor(private validateOAuthUserUseCase: ValidateOAuthUserUseCase) {
    super({
      clientID: env.APPLE_CLIENT_ID,
      teamID: env.APPLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/apple/callback',
      keyID: 'your_key_id',
      privateKeyLocation: 'path/to/key',
      passReqToCallback: true,
      scope: ['name', 'email'],
    });
  }

  async validate(
    _req: any,
    accessToken: string,
    refreshToken: string,
    idToken: string,
    profile: AppleProfile,
    done: (error: Error | null, user?: any) => void,
  ): Promise<void> {
    try {
      // Apple provides limited information, mainly the ID
      const appleUserId = profile.id;

      // Note: Apple doesn't consistently provide email and name in every request,
      // only in the first authorization, so this should be handled at frontend level
      const email = profile.email || `${appleUserId}@apple.user`;

      let name = `Apple User ${appleUserId.substring(0, 5)}`;
      if (profile.name?.firstName) {
        name =
          `${profile.name.firstName} ${profile.name.lastName || ''}`.trim();
      }

      const userData: OAuthLoginDto = {
        provider: Provider.APPLE,
        providerId: appleUserId,
        email,
        name,
        photoUrl: undefined,
      };

      const user = await this.validateOAuthUserUseCase.execute(userData);
      done(null, user);
    } catch (error) {
      done(error instanceof Error ? error : new Error('Authentication error'));
    }
  }
}
