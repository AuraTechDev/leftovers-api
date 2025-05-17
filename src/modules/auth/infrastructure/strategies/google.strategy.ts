import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Provider } from '@prisma/client';
import { ValidateOAuthUserUseCase } from '../../application/use-cases';
import { authConfig } from '../../../../config/auth.config';

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
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private validateOAuthUserUseCase: ValidateOAuthUserUseCase) {
    // Skip strategy setup if Google OAuth is not configured
    if (!authConfig.providers.google.enabled) {
      super({});
      return;
    }

    super({
      clientID: authConfig.providers.google.clientID,
      clientSecret: authConfig.providers.google.clientSecret,
      callbackURL: authConfig.providers.google.callbackURL,
      scope: authConfig.providers.google.scope,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ) {
    try {
      const { id, name, emails, photos } = profile;

      if (!emails || emails.length === 0) {
        return done(new UnauthorizedException('Email is required'), null);
      }

      const user = await this.validateOAuthUserUseCase.execute({
        provider: Provider.GOOGLE,
        providerId: id,
        email: emails[0].value,
        name: `${name.givenName} ${name.familyName}`.trim(),
        photoUrl: photos?.[0]?.value,
      });

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
