import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { env } from '../../../../config/env.config';
import { AuthService } from '../../application/services/auth.service';
import { Provider } from '@prisma/client';

// Define interface for Google profile
interface GoogleProfile {
  id: string;
  name: {
    givenName: string;
    familyName: string;
  };
  emails: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy as any,
  'google',
) {
  constructor(private authService: AuthService) {
    super({
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ) {
    const { id, name, emails, photos } = profile;

    const user = await this.authService.validateOAuthUser({
      provider: Provider.GOOGLE,
      providerId: id,
      email: emails[0].value,
      name: name.givenName + ' ' + name.familyName,
      photoUrl: photos?.[0]?.value,
    });

    done(null, user);
  }
}
