import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import { env } from '../../../../config/env.config';
import { AuthService } from '../../application/services/auth.service';
import { Provider } from '@prisma/client';
import { OAuthLoginDto } from '../../infrastructure/dto/oauth-login.dto';

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
  constructor(private authService: AuthService) {
    super({
      clientID: env.APPLE_CLIENT_ID,
      teamID: env.APPLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/apple/callback',
      keyID: 'your_key_id', // Necesitarás configurar esto
      privateKeyLocation: 'path/to/key', // Necesitarás configurar esto
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
      // Apple proporciona información limitada, principalmente el ID
      const appleUserId = profile.id;

      // Nota: Apple no proporciona consistentemente email y nombre en cada solicitud,
      // solo en la primera autorización, por lo que habría que manejar eso a nivel de frontend
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

      const user = await this.authService.validateOAuthUser(userData);
      done(null, user);
    } catch (error) {
      done(error instanceof Error ? error : new Error('Authentication error'));
    }
  }
}
