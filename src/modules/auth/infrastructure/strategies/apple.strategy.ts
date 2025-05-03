import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import { env } from '../../../../config/env.config';
import { AuthService } from '../../application/services/auth.service';
import { Provider } from '@prisma/client';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(private authService: AuthService) {
    super({
      clientID: env.APPLE_CLIENT_ID,
      teamID: env.APPLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/apple/callback',
      keyID: 'your_key_id', // Necesitarás configurar esto
      privateKeyLocation: 'path/to/key', // Necesitarás configurar esto
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    idToken: string,
    profile: any,
    done: any,
  ) {
    // Apple proporciona información limitada, principalmente el ID
    const appleUserId = profile.id;

    // Nota: Apple no proporciona consistentemente email y nombre en cada solicitud,
    // solo en la primera autorización, por lo que habría que manejar eso a nivel de frontend
    const email = profile.email || `${appleUserId}@apple.user`;
    const name = profile.name?.firstName
      ? `${profile.name.firstName} ${profile.name.lastName || ''}`.trim()
      : `Apple User ${appleUserId.substring(0, 5)}`;

    const user = await this.authService.validateOAuthUser({
      provider: Provider.APPLE,
      providerId: appleUserId,
      email,
      name,
      photoUrl: null,
    });

    done(null, user);
  }
}
