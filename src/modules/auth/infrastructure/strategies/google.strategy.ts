import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { env } from '../../../../config/env.config';
import { Provider } from '@prisma/client';
import { ValidateOAuthUserUseCase } from '../../application/use-cases';

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
  constructor(private validateOAuthUserUseCase: ValidateOAuthUserUseCase) {
    super({
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
      scope: env.GOOGLE_SCOPE,
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
        return done(new UnauthorizedException('Email is required'), false);
      }

      const user = await this.validateOAuthUserUseCase.execute({
        provider: Provider.GOOGLE,
        providerId: id,
        email: emails[0].value,
        name: name.givenName + ' ' + name.familyName,
        photoUrl: photos?.[0]?.value,
      });

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
